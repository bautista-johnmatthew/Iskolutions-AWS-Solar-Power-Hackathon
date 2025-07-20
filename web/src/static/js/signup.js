import {validateSignUp, validateField,  preloadSchemas} from './schema.js';

$(document).ready(function() {
    console.log("App loaded successfully");
    
    preloadSchemas();
    
    // Handle signup form submission
    $("#signupForm").on("submit", function(event) {
        event.preventDefault();
        
        const formData = {
            username: $("#username").val(),
            email: $("#email").val(),
            password: $("#password").val(),
            confirmPassword: $("#confirmPassword").val()
        };
        
        const validationResult = validateSignUp(formData);
        
        if (validationResult.isValid) {
            console.log("Form is valid:", validationResult.data);
            // Here you can proceed with form submission, e.g., send data to the server
        } else {
            console.error("Validation errors:", validationResult.error);
            // Display errors to the user
            alert(validationResult.error.map(err => err.message).join("\n"));
        }
    });

    // Handle individual field validation
    $("#username").on("blur", function() {
        const validationResult = validateField('username', $("#username").val());
        
        if (!validationResult.isValid) {
            console.error("Field validation errors:", validationResult.error);
            // Optionally display field-specific errors
        }
    });

    // Handle email field validation
    $("#email").on("blur", function() {
        const validationResult = validateField('email', $("#email").val());
        
        if (!validationResult.isValid) {
            console.error("Field validation errors:", validationResult.error);
            // Optionally display field-specific errors
        }
    });

    // Handle password field validation
    $("#password").on("blur", function() {
        const validationResult = validateField('password', $("#password").val());
        
        if (!validationResult.isValid) {
            console.error("Field validation errors:", validationResult.error);
            // Optionally display field-specific errors
        }
    });

    // Handle student number field validation
    $("#studentNumber").on("blur", function() {
        const validationResult = validateField('studentNumber', $("#studentNumber").val()); 
        if (!validationResult.isValid) {
            console.error("Field validation errors:", validationResult.error);
            // Optionally display field-specific errors
        }
    });

    // Handle confirm_password field validation
    $("#confirmPassword").on("blur", function() {
        const validationResult = validateField('confirmPassword', $("#confirmPassword").val());
        
        if (!validationResult.isValid) {
            console.error("Field validation errors:", validationResult.error);
            // Optionally display field-specific errors
        }
    });
        
});


