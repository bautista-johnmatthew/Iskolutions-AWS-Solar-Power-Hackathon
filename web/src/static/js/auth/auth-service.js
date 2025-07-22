import { BASE_API_URL } from '../utils/base-api-url.js';
import { sessionManager } from './session-manager-vanilla.js';

/**
 * Simplified authentication service for core login/logout/register functionality
 */
export class AuthService {
    
    /**
     * Login user with email and password
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        try {
            const response = await fetch(`${BASE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const userData = await response.json();
            
            // Store session
            sessionManager.setSession(userData);
            
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            const token = sessionManager.getToken();
            
            // Optional: Call backend logout endpoint
            if (token) {
                await fetch(`${BASE_API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local session
            sessionManager.clearSession();
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            console.log('Sending registration data:', userData);
            
            const response = await fetch(`${BASE_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                let errorMessage = 'Registration failed';
                try {
                    const errorData = await response.json();
                    console.error('Registration error response:', errorData);
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMessage);
            }

            const newUser = await response.json();
            console.log('Registration response:', newUser);
            
            // Store session if registration successful and user is logged in
            if (newUser.token) {
                sessionManager.setSession(newUser);
            }
            
            return newUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Confirm email with token
     */
    async confirmEmail(email, token) {
        try {
            const response = await fetch(`${BASE_API_URL}/auth/confirm-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token }),
            });

            if (!response.ok) {
                throw new Error('Email confirmation failed');
            }

            const result = await response.json();
            
            // Store session if confirmation creates a session
            if (result.token) {
                sessionManager.setSession(result);
            }
            
            return result;
        } catch (error) {
            console.error('Email confirmation error:', error);
            throw error;
        }
    }

    /**
     * Resend confirmation email
     */
    async resendConfirmation(email) {
        try {
            const response = await fetch(`${BASE_API_URL}/auth/resend-confirmation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to resend confirmation');
            }

            return await response.json();
        } catch (error) {
            console.error('Resend confirmation error:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
