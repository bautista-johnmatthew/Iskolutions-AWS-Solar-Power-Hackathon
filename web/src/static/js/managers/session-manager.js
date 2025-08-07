/**
 * Session Manager for handling user authentication state
 * when login is handled on the backend
 */
class SessionManager {
    constructor() {
        this.SESSION_KEY = 'user_session';
        this.user = null;
        this.isLoaded = false;
    }

    /**
     * Initialize session from storage
     */
    initialize() {
        try {
            const sessionData = sessionStorage.getItem(this.SESSION_KEY);
            if (sessionData) {
                this.user = JSON.parse(sessionData);
                this.isLoaded = true;
                return this.user;
            }
        } catch (error) {
            console.error('Failed to load session:', error);
            this.clearSession();
        }
        this.isLoaded = true;
        return null;
    }

    /**
     * Set user session after successful login
     * @param {Object} userData - User data from backend
     */
    setSession(userData) {
        this.user = userData;
        try {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    }

    /**
     * Get current user data
     */
    getUser() {
        if (!this.isLoaded) {
            this.initialize();
        }
        return this.user;
    }

    /**
     * Get user ID (author_id)
     */
    getUserId() {
        const user = this.getUser();
        return user?.id || user?.user_id || user?.author_id || null;
    }

    /**
     * Get user email
     */
    getUserEmail() {
        const user = this.getUser();
        return user?.email || null;
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return !!this.getUser();
    }

    /**
     * Clear session (for logout)
     */
    clearSession() {
        this.user = null;
        this.isLoaded = false;
        try {
            sessionStorage.removeItem(this.SESSION_KEY);
            // Also clear any related storage
            localStorage.removeItem(this.SESSION_KEY);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }

    /**
     * Get session token/JWT if available
     */
    getToken() {
        const user = this.getUser();
        return user?.token || user?.access_token || user?.jwt || null;
    }

    /**
     * Update user data (e.g., after profile update)
     */
    updateUser(userData) {
        if (this.user) {
            this.user = { ...this.user, ...userData };
            this.setSession(this.user);
        }
    }
}

// Export singleton instance
export const sessionManager = new SessionManager();
