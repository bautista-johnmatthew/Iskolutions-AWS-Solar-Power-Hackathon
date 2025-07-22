import { sessionManager } from '../auth/session-manager-vanilla.js';
import { authService } from '../auth/auth-service.js';
import { validateField, validateLogin } from './schema.js';
import { addErrorMessage, clearErrorMessage } from '../utils/errorhandling.js';

/**
 * Login page functionality
 * Handles user authentication, session management, and UI updates
 */

// Handle login form submission
async function handleLogin(email, password) {
    try {
        // Clear any existing error messages
        clearErrorMessage('#email');
        clearErrorMessage('#password');

        // Validate email field
        const emailValidation = validateField('email', email);
        if (!emailValidation.isValid) {
            addErrorMessage('#email', emailValidation.error);
        } else {
            clearErrorMessage('#email');
        }

        // Validate password field
        const passwordValidation = validateField('password', password);
        if (!passwordValidation.isValid) {
            addErrorMessage('#password', passwordValidation.error);
        } else {
            clearErrorMessage('#password');
        }

        const user = await authService.login(email, password);
        console.log('Login successful:', user);
        updateUserInfo();
        clearLoginForm();
        return user;
    } catch (error) {
        console.error('Login failed:', error);
        addErrorMessage('#email', error.message || 'Login failed');
        throw error;
    }
}

// Handle logout
async function handleLogout() {
    try {
        await authService.logout();
        console.log('Logout successful');
        updateUserInfo();
    } catch (error) {
        console.error('Logout error:', error);
        addErrorMessage('#email', 'Logout failed');
    }
}

// Set test session for development/testing
function setTestSession() {
    const testUser = {
        id: 'test-user-123',
        email: 'test@pup.edu.ph',
        name: 'Test User',
        token: 'fake-jwt-token'
    };
    sessionManager.setSession(testUser);
    updateUserInfo();
}

// Clear login form fields
function clearLoginForm() {
    $('#email').val('');
    $('#password').val('');
}

// Update user information display
function updateUserInfo() {
    const user = sessionManager.getUser();
    const userInfo = $('#userInfo');
    
    if (user) {
        userInfo.html(`
            <div class="alert alert-success">
                <strong>Logged in as:</strong> ${user.email || user.name}<br>
                <strong>User ID:</strong> ${sessionManager.getUserId()}<br>
                <strong>Token:</strong> ${sessionManager.getToken() ? 'Present' : 'None'}
            </div>
            <button class="btn btn-info btn-sm" id="setTestSession">Set Test Session</button>
        `);
    } else {
        userInfo.html(`
            <div class="alert alert-warning">
                Not logged in
            </div>
            <button class="btn btn-info btn-sm" id="setTestSession">Set Test Session</button>
        `);
    }
}

// Initialize when document is ready
$(document).ready(function() {
    // Initialize session
    sessionManager.initialize();
    updateUserInfo();

    // Login form submission
    $('#loginForm').on('submit', async function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        const password = $('#password').val();
        
        await handleLogin(email, password);
    });

    // Validate email field
    $('#email').on('blur', function() {
        const validationResult = validateField('email', $(this).val());
        if (!validationResult.isValid) {
            addErrorMessage('#email', validationResult.error);
        } else {
            clearErrorMessage('#email');
        }
    });

    // Validate password field
    $('#password').on('blur', function() {
        const validationResult = validateField('password', $(this).val());
        if (!validationResult.isValid) {
            addErrorMessage('#password', validationResult.error);
        } else {
            clearErrorMessage('#password');
        }
    });

    // Logout button
    $('#logoutBtn').on('click', async function() {
        await handleLogout();
    });

    // Set test session button (for development/testing)
    $(document).on('click', '#setTestSession', function() {
        setTestSession();
    });
});
