import React, { useReducer, useEffect } from "react";

import { validate } from '../../util/validators'
import './Input.css';

const inputReducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE':
      return {
        ...state,       // Keeps the existing state properties
        value: action.val,  // Updates the input value based on the action
        isValid: validate(action.val, action.validators),  // Sets the validity of the input (currently hardcoded as `true`)
      };
    case 'TOUCH':
      return {
        ...state,
        isTouched: true // Marks the input as touched (indicates the user has interacted with it)
      }
    default:
      return state;  // Returns the current state if the action type is unrecognized
  }
};


function Input(props) {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue|| '',
    isTouched: false,
    isValid: props.initialIsValid || false
  });


  const { id, onInput } = props;
  const { value, isValid } = inputState;

  useEffect(() => {
    props.onInput(id, value, isValid)
  }, [id, value, isValid, onInput]);


  // Event handler to dispatch changes when input is modified
  const changeHandler = (event) => {
    dispatch({ type: "CHANGE", val: event.target.value, validators: props.validators });  // Corrected 'typs' to 'type'
  };

  const touchHandler = () => {
    dispatch({ type: 'TOUCH' });
  }

  // Determine whether to render an input or textarea based on props
  const element = props.element === 'input' ? (
    <input
      id={props.id}
      type={props.type}
      placeholder={props.placeholder}
      onChange={changeHandler}
      onBlur={touchHandler}
      value={inputState.value}
    />
  ) : (
    <textarea
      id={props.id}
      rows={props.rows || 3}
      onChange={changeHandler}
      onBlur={touchHandler}
      value={inputState.value}
    />
  );

  // Rendering the input element with label and error messages
  return (
    <div className={`form-control ${!inputState.isValid && inputState.isTouched && 'form-control--invalid'}`}>
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      {!inputState.isValid && inputState.isTouched && <p>{props.errorText}</p>}
    </div>
  );
}

export default Input;
