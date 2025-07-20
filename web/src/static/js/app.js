import {validateSignUp, validateForumPost, preloadSchemas} from './schema.js';

$(document).ready(function() {
    console.log("App loaded successfully");
    
    preloadSchemas();
    $("#signup-form").on('submit', handleSignupForm);
});

function handleSignupForm(event) {
    event.preventDefault();
    const formData = {
        username: $("#signup-form input[name='username']").val(),
        email: $("#signup-form input[name='email']").val(),
        studentNumber: $("#signup-form input[name='studentNumber']").val(),
        password: $("#signup-form input[name='password']").val(),
        confirmPassword: $("#signup-form input[name='confirmPassword']").val()
    };
    
    try {
        const validatedData = validateSignUp(formData);
        console.log("Form validation successful:", validatedData);
        
        // Submit the form data to your backend here
        // For example: fetch('/signup', { method: 'POST', body: JSON.stringify(validatedData) })
        
    } catch (error) {
        console.error("Validation error:", error.message);
        // Display error to the user
        // For example: document.querySelector("#error-message").textContent = error.message;
    }
}


