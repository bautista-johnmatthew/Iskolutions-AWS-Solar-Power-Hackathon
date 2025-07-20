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

    // Reusable function to attach field validation
    function attachFieldValidation(fieldName, selector) {
        $(selector).on("blur", function() {
            const validationResult = validateField(fieldName, $(selector).val());
            
            if (!validationResult.isValid) {
                console.error(`Validation errors for ${fieldName}:`, validationResult.error);
                // Optionally display field-specific errors
            }
        });
    }

    // Attach validation to fields
    attachFieldValidation('username', '#username');
    attachFieldValidation('email', '#email');
    attachFieldValidation('password', '#password');
    attachFieldValidation('studentNumber', '#studentNumber');
    attachFieldValidation('confirmPassword', '#confirmPassword');
        
});


