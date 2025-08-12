import { sessionManager } from '../managers/session-manager.js';
import { authService } from '../auth/auth-service.js';
import { validateField } from './schema.js';
import { addErrorMessage, clearErrorMessage } from '../utils/error-handling.js';

/**
 * Login page functionality
 * Handles user authentication, session management, and UI updates
 */

// Handle login form submission
async function handleLogin(username, password) {
    try {
        // Clear any existing error messages
        clearErrorMessage('#username');
        clearErrorMessage('#password');

        // Validate username field
        const usernameValidation = validateField('username', username);
        if (!usernameValidation.isValid) {
            addErrorMessage('#username', usernameValidation.error);
        } else {
            clearErrorMessage('#username');
        }

        // Validate password field
        const passwordValidation = validateField('password', password);
        if (!passwordValidation.isValid) {
            addErrorMessage('#password', passwordValidation.error);
        } else {
            clearErrorMessage('#password');
        }

        const user = await authService.login(username, password);
        console.log('Login successful:', user);
        clearLoginForm();

        // Redirect to feed page after successful login
        window.location.href += 'templates/feed.html';

        return user;
    } catch (error) {
        console.error('Login failed:', error);
        addErrorMessage('#username', error.message || 'Login failed');
        throw error;
    }
}

// Handle logout
async function handleLogout() {
    try {
        await authService.logout();
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
        addErrorMessage('#username', 'Logout failed');
    }
}

// Clear login form fields
function clearLoginForm() {
    $('#username').val('');
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
        `);
    } else {
        userInfo.html(`
            <div class="alert alert-warning">
                Not logged in
            </div>
        `);
    }
}

// Initialize when document is ready
$(document).ready(function() {
    // Initialize session
    console.log('Initializing session manager...');
    sessionManager.initialize();

    // Login form submission
    $('#loginForm').on('submit', async function(e) {
        e.preventDefault();
        
        const username = $('#username').val();
        const password = $('#password').val();

        await handleLogin(username, password);
    });

    // Validate username field
    $('#username').on('blur', function() {
        const validationResult = validateField('username', $(this).val());
        if (!validationResult.isValid) {
            addErrorMessage('#username', validationResult.error);
        } else {
            clearErrorMessage('#username');
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
});
