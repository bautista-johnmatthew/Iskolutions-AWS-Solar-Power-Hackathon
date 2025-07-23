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
    
    // Show email confirmation section
    const confirmationHtml = `
        <div id="emailConfirmationSection" class="card">
            <div class="card-header">
                <h4 class="mb-0">Confirm Your Email</h4>
            </div>
            <div class="card-body">
                <div class="alert alert-info">
                    <i class="fas fa-envelope"></i>
                    We've sent a confirmation code to <strong>${email}</strong>
                </div>
                <form id="emailConfirmForm">
                    <div class="mb-3">
                        <label for="confirmationToken" class="form-label">Confirmation Code</label>
                        <input type="text" class="form-control" id="confirmationToken" 
                               placeholder="Enter 6-digit code" required maxlength="6">
                        <div id="confirmationToken-error" class="invalid-feedback d-none"></div>
                        <small class="form-text text-muted">Check your email for the confirmation code</small>
                    </div>
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary">Confirm Email</button>
                        <button type="button" id="resendCodeBtn" class="btn btn-outline-secondary">
                            Resend Code
                        </button>
                    </div>
                </form>
                <div class="mt-3">
                    <a href="#" id="backToSignupBtn" class="text-muted">
                        <i class="fas fa-arrow-left"></i> Back to Sign Up
                    </a>
                </div>
            </div>
        </div>
    `;

    // Insert confirmation form after register form
    $("#registerForm").after(confirmationHtml);
    
    // Attach event handlers for confirmation form
    attachEmailConfirmationHandlers(email);
}

// Function to attach email confirmation event handlers
function attachEmailConfirmationHandlers(email) {
    // Handle email confirmation form submission
    $("#emailConfirmForm").on("submit", async function(event) {
        event.preventDefault();
        
        const token = $("#confirmationToken").val().trim();
        
        if (!token) {
            addErrorMessage('#confirmationToken', 'Please enter the confirmation code');
            return;
        }
        
        try {
            // Clear any existing error messages
            clearErrorMessage('#confirmationToken');
            
            // Show loading state
            const submitBtn = $("#emailConfirmForm button[type='submit']");
            submitBtn.prop('disabled', true);
            
            // Add loading message
            const loadingMsg = $('<p id="confirmLoadingMsg" class="text-muted mt-2"><i class="fas fa-spinner fa-spin"></i> Confirming your email...</p>');
            submitBtn.after(loadingMsg);
            
            // Call email confirmation service
            const result = await authService.confirmEmail(email, token);
            
            console.log('Email confirmation successful:', result);
            
            // Show success message and redirect
            showEmailConfirmationSuccess();
            
        } catch (error) {
            console.error('Email confirmation failed:', error);
            addErrorMessage('#confirmationToken', error.message || 'Invalid confirmation code');
        } finally {
            // Reset button state
            const submitBtn = $("#emailConfirmForm button[type='submit']");
            submitBtn.prop('disabled', false);
            $("#confirmLoadingMsg").remove();
        }
    });
    
    // Handle resend code button
    $("#resendCodeBtn").on("click", async function() {
        try {
            const btn = $(this);
            const originalText = btn.text();
            btn.prop('disabled', true).text('Sending...');
            
            // Call resend confirmation service
            await authService.resendConfirmation(email);
            
            // Show success message
            const alertHtml = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    Confirmation code resent to ${email}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            $("#emailConfirmForm").prepend(alertHtml);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                $('.alert-success').fadeOut();
            }, 5000);
            
        } catch (error) {
            console.error('Resend failed:', error);
            addErrorMessage('#confirmationToken', 'Failed to resend code. Please try again.');
        } finally {
            const btn = $("#resendCodeBtn");
            btn.prop('disabled', false).text('Resend Code');
        }
    });
    
    // Handle back to signup button
    $("#backToSignupBtn").on("click", function(event) {
        event.preventDefault();
        $("#emailConfirmationSection").remove();
        $("#registerForm").show();
        clearRegisterForm();
    });
}

// Function to show email confirmation success
function showEmailConfirmationSuccess() {
    $("#emailConfirmationSection").html(`
        <div class="card">
            <div class="card-body text-center">
                <div class="mb-4">
                    <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
                </div>
                <h4 class="text-success">Email Confirmed!</h4>
                <p class="text-muted mb-4">Your account has been successfully verified.</p>
                <div class="d-grid">
                    <a href="/web/src/templates/index.html" class="btn btn-primary">Continue to Dashboard</a>
                </div>
            </div>
        </div>
    `);
}

// Function to clear register form
function clearRegisterForm() {
    $("#registerForm")[0].reset();
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


