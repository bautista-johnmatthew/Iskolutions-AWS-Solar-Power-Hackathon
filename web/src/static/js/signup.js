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
    });

    $("#confirmPassword").on("blur", function() {
        const password = $("#password").val();
        const confirmPassword = $(this).val();
        
        if (password !== confirmPassword) {
            console.error(`Validation errors for confirmPassword:`, "Passwords do not match");            
        }
    });

    // Reusable function to attach field validation
    function attachFieldValidation(fieldName, selector) {
        $(selector).on("blur", function() {
            const validationResult = validateField(fieldName, $(selector).val());
            
            if (!validationResult.isValid) {
                console.error(`Validation errors for ${fieldName}:`, validationResult.error);
                // TODO: Handle error message by changing the error label text
            }
        });
    }

    // Attach validation to fields
    attachFieldValidation('username', '#username');
    attachFieldValidation('email', '#email');
    attachFieldValidation('password', '#password');
    attachFieldValidation('studentNumber', '#studentNumber');
});


