import { BASE_API_URL } from '../utils/base-api-url.js';
import { sessionManager } from './session-manager-vanilla.js';

/**
 * Authentication service for handling login/logout with backend
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
            const response = await fetch(`${BASE_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const newUser = await response.json();
            
            // Automatically log in after registration
            sessionManager.setSession(newUser);
            
            return newUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
