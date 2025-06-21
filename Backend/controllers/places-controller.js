const fs = require('fs');

const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.', 500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find a place for the provided id.', 404);
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });

};



const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  //let places
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later', 500
    );
    return next(error);
  }
  //  if(!places|| places.length===0){}
  if (!userWithPlaces || userWithPlaces.places.length === 0) {

    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};


const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors);
    throw (new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const { title, description, address} = req.body;
  // const title = req.body.title;
  const coordinates = getCoordsForAddress(address);

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator:req.userData.userId
  });
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating place failed, try again', 500)
    return next(error);
  }
  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }
  console.log(user);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();

  } catch (err) {
    const error = new HttpError('Creating place failed,please try again.', 500);
    return next(error);
  }


  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }
  const { title, description } = req.body;

  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  }
  catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.', 500
    );
    return next(error);
  }

  if(place.creator.toString() !== req.userData.userId)
  {
    const error = new HttpError(
      'You are not allowed to edit this place.', 401
    );
    return next(error);

  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.', 500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });


};
const deletePlace = async (req, res, next) => {

  const placeId = req.params.pid.trim();

  // Log the received placeId
  console.log(`Received request to delete place with ID: ${placeId}`);

  // Validate placeId
  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    console.log(`Invalid place ID: ${placeId}`);
    return next(new HttpError('Invalid place ID.', 400));
  }

  let place;
  try {
    // Find the place by ID and populate the creator field
    place = await Place.findById(placeId).populate('creator');
    console.log(`Place found: ${place}`);
  } catch (err) {
    console.error('Error finding place:', err);
    const error = new HttpError('Something went wrong, could not delete place.', 500);
    return next(error);
  }
  const imagePath = place.image;

  if (!place) {
    console.log(`No place found with ID: ${placeId}`);
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  if(place.creator.id!== req.userData.userId)
    {
       const error=new HttpError('You are not allowed to delete this place',401);
       return next(error);
    } 


  try {
    // Start a session and initiate a transaction
    const sess = await mongoose.startSession();
    sess.startTransaction();

    // Delete the place
    await place.deleteOne({ session: sess });
    console.log(`Place with ID: ${placeId} deleted`);

    // Remove the place reference from the creator's places array
    place.creator.places.pull(place.id); // Use place.id for consistency
    console.log(`Place ID: ${place.id} removed from user ${place.creator.id}'s places`);

    // Save the updated creator document
    await place.creator.save({ session: sess });
    console.log(`User ${place.creator.id}'s places updated`);

    // Commit the transaction
    await sess.commitTransaction();
    sess.endSession();
  } catch (err) {
    console.error('Error during deletion transaction:', err);
    const error = new HttpError('Something went wrong, could not delete place.', 500);
    return next(error);
  }

  fs.unlink(imagePath, err => {
    console.log(err);
  });

  // Respond with a success message
  res.status(200).json({ message: 'Deleted place.' });

};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
