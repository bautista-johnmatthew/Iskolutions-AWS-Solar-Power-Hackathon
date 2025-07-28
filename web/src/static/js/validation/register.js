import { validateSignUp, validateField, preloadSchemas } from './schema.js';
import { addErrorMessage, clearErrorMessage } from '../utils/error-handling.js';
import { authService } from '../auth/auth-service.js';

// Form validation and submission handlers
async function handleRegisterFormSubmit(event) {
    clearErrorMessage('#confirmPassword');
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
        
        try {
            // Show loading state
            const submitBtn = $("#registerForm button[type='submit']");
            submitBtn.prop('disabled', true);
            
            // Add loading message
            const loadingMsg = $('<p id="loadingMsg" class="text-muted mt-2"><i class="fas fa-spinner fa-spin"></i> Creating your account...</p>');
            submitBtn.after(loadingMsg);
            
            // Prepare data for registration (exclude confirmPassword)
            const registrationData = {
                username: $("#username").val(),
                email: $("#email").val(),
                password: $("#password").val(),
                student_id: $("#studentNumber").val(),
                role: "student",
                is_verified: false
            };
            
            // Call registration service
            const result = await authService.register(registrationData);
            console.log('Registration successful:', result);
            
            // Show email confirmation prompt
            showEmailConfirmationPrompt(formData.email);
            
        } catch (error) {
            console.error('Registration failed:', error);
            addErrorMessage('#confirmPassword', error.message || 'Registration failed');
        } finally {
            // Reset button state
            const submitBtn = $("#registerForm button[type='submit']");
            submitBtn.prop('disabled', false);
            $("#loadingMsg").remove();
        }
    } else {
        console.error("Validation errors:", validationResult.error);
        addErrorMessage('#confirmPassword', 'Please fix the errors before submitting');
    }
}

// Function to show email confirmation prompt
function showEmailConfirmationPrompt(email) {
    // Hide the register form
    $("#registerForm").hide();
    
    let currentWindow = window.location.href
    window.location.href = currentWindow.replace('register.html', 'confirm-email.html?email=' + (email));

    // Removed the usage of undefined confirmationHTML to prevent runtime error.
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
    $("#registerForm").on("submit", handleRegisterFormSubmit);
    $("#confirmPassword").on("blur", handleConfirmPasswordBlur);

    // Attach validation to fields
    attachFieldValidation('username', '#username');
    attachFieldValidation('email', '#email');
    attachFieldValidation('password', '#password');
    attachFieldValidation('studentNumber', '#studentNumber');
});


