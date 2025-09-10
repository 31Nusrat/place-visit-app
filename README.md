# Place Visit App

A full-stack MERN application to log, manage, and share visited places with images and descriptions. Built with React, Node.js, Express, and MongoDB.

---

## Features

- **Authentication:** JWT-based login/signup with password encryption (bcrypt)
- **CRUD Operations:** Add, edit, delete, and view places; image uploads handled with Multer
- **Frontend:** Responsive React UI with form validation and protected routes
- **Backend:** RESTful API with structured controllers and services
- **Database:** MongoDB with Mongoose schema modeling
- **Deployment-ready:** Fully functional app architecture for production



---

## Tech Stack

- **Frontend:** React, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer

---

## Installation
```bash
# Clone the repository
git clone https://github.com/31Nusrat/place-visit-app.git
cd place-visit-app

# Setup Backend
cd backend
npm install

# Create a .env file with the following content:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

npm start &

# Setup Frontend
cd ../frontend
npm install
npm start

