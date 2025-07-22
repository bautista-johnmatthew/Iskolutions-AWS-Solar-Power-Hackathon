import { validateSignUp, validateField, preloadSchemas } from './schema.js';
import { addErrorMessage, clearErrorMessage } from '../errorhandling.js';

// Form validation and submission handlers
function handleSignupFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        username: $("#username").val(),
        email: $("#email").val(),
        password: $("#password").val(),
        studentNumber: $("#studentNumber").val(),
        confirmPassword: $("#confirmPassword").val()
    };
    
    const validationResult = validateSignUp(formData);
    
    if (validationResult.isValid) {
        console.log("Form is valid:", validationResult.data);
        // Here you can proceed with form submission, e.g., send data to the server
    } else {
        console.error("Validation errors:", validationResult.error);
        // TODO: Handle error message by alerting after submission
    }
}

// Function to handle confirm password validation
function handleConfirmPasswordBlur() {
    const password = $("#password").val();
    const confirmPassword = $(this).val();
    
    if (password !== confirmPassword) {
        console.error(`Validation errors for confirmPassword:`, "Passwords do not match");            
        addErrorMessage("#confirmPassword", "Passwords do not match");
    } else {
        clearErrorMessage("#confirmPassword");
    }
}

// Function to create a field validation handler
function createFieldValidationHandler(fieldName) {
    return function() {
        const validationResult = validateField(fieldName, $(this).val());
        
        if (!validationResult.isValid) {
            console.error(`Validation errors for ${fieldName}:`, validationResult.error);
            addErrorMessage(`#${fieldName}`, validationResult.error);
        } else {
            clearErrorMessage(`#${fieldName}`);
        }
    };
}

// Function to attach validation to a field
function attachFieldValidation(fieldName, selector) {
    $(selector).on("blur", createFieldValidationHandler(fieldName));
}

$(document).ready(function() {
    console.log("App loaded successfully");
    
    preloadSchemas();
    
    // Attach event listeners
    $("#signupForm").on("submit", handleSignupFormSubmit);
    $("#confirmPassword").on("blur", handleConfirmPasswordBlur);

    // Attach validation to fields
    attachFieldValidation('username', '#username');
    attachFieldValidation('email', '#email');
    attachFieldValidation('password', '#password');
    attachFieldValidation('studentNumber', '#studentNumber');
});


