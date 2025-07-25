import { BASE_API_URL } from '../utils/base-api-url.js';
import { sessionManager } from './session-manager-vanilla.js';

/**
 * Simplified authentication service for core login/logout/register functionality
 */
export class AuthService {
    
    /**
     * Login user with username and password
     * @param {string} username 
     * @param {string} password 
     */
    async login(username, password) {
        try {
            const response = await fetch(`${BASE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
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

    async verifyToken(token) {
        try {
            const response = await fetch(`${BASE_API_URL}/auth/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Token verification failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    /**
     * Process URL parameters from Supabase authentication callback
     * @returns {Object|null} Auth data if found, null otherwise
     */
    async processAuthCallback() {
        try {
            // Check if URL contains hash with access_token
            const hash = window.location.hash;
            if (!hash || !hash.includes('access_token=')) return null;
            
            // Extract parameters from URL hash
            const params = new URLSearchParams(hash.substring(1));
            
            const authData = {
                token: params.get('access_token'),
                refreshToken: params.get('refresh_token'),
                expiresAt: params.get('expires_at'),
                expiresIn: params.get('expires_in'),
                tokenType: params.get('token_type'),
                type: params.get('type')
            };
            
            if (authData.token) {
                await this.verifyToken(authData.token);
                
                // Clean URL by removing hash
                history.replaceState(null, document.title, window.location.pathname);
                window.location.href = '/';

                return authData;
            }
            
            return null;
        } catch (error) {
            console.error('Auth callback processing error:', error);
            return null;
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
