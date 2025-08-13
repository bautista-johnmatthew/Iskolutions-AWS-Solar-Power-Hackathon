import profileUtils from "./profileUtils.js";
import { feedManager } from "../managers/feed-manager.js";
import { sessionManager } from "../managers/session-manager.js";

// Initialize profile handler when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const profileHandler = new ProfileHandler();
        await profileHandler.initialize();

        // Make handler available globally for debugging
        window.profileHandler = profileHandler;
    } catch (error) {
        console.error('Failed to initialize profile page:', error);
    }
});

/**
 * ProfileHandler - Handles profile page data loading and UI updates
 */
export class ProfileHandler {
    constructor() {
        this.feedManager = feedManager;
        this.profileUtils = profileUtils;
        this.sessionManager = sessionManager;
        this.isLoading = false;
        this.currentProfile = null;
    }

    /**
     * Initialize the profile handler and load profile data
     */
    async initialize() {
        try {
            // Initialize session manager if not already done
            if (!this.sessionManager.isLoaded) {
                this.sessionManager.initialize();
            }

            // Check if user is authenticated
            if (!this.sessionManager) {
                this.handleUnauthenticatedUser();
                return;
            }

            // Load and display current user's profile
            await this.loadCurrentUserProfile();

            // Set up event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Failed to initialize profile handler:', error);
            this.showError('Failed to load profile. Please try refreshing the page.');
        }
    }

    /**
     * Load current user's profile data and update the UI
     */
    async loadCurrentUserProfile() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoadingState();

            // Get current user's profile with aggregated data
            const profile = await this.profileUtils.getCurrentUserProfile();

            if (!profile) {
                throw new Error('Failed to load profile data');
            }

            this.currentProfile = profile;
            await this.updateProfileUI(profile);
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading user profile:', error);
            this.showError('Failed to load profile data. Please try refreshing the page.');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Update the profile UI with user data
     * @param {Object} profile - User profile data
     */
    async updateProfileUI(profile) {
        try {
            // Update basic profile information
            this.updateElement('username', profile.username || 'Unknown User');
            this.updateElement('email', profile.email || 'No email available');
            this.updateElement('student-number', profile.studentNumber || 'Not available');

            // Update statistics
            this.updateElement('post-count', profile.postsCount || 0);
            this.updateElement('comment-count', profile.commentsCount || 0);
            this.updateElement('reputation', profile.reputationScore || 0);

            const username = this.sessionManager.getUserName();
            this.feedManager.loadUserPosts(await this.profileUtils.getUserPosts(username));

            console.log('Profile UI updated successfully:', profile);
        } catch (error) {
            console.error('Error updating profile UI:', error);
            this.showError('Failed to display profile information');
        }
    }

    /**
     * Update a DOM element's text content
     * @param {string} elementId - ID of the element to update
     * @param {string|number} value - Value to set
     */
    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with ID '${elementId}' not found`);
        }
    }

    /**
     * Set up event listeners for profile interactions
     */
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Edit profile icon (if functionality is added later)
        const editIcon = document.querySelector('.edit-icon');
        if (editIcon) {
            editIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEditProfile();
            });
        }

        // Navigation links
        this.setupNavigationListeners();
    }

    /**
     * Set up navigation event listeners
     */
    setupNavigationListeners() {
        // Home/Feed navigation
        const feedLink = document.querySelector('a[href="feed.html"]');
        if (feedLink) {
            feedLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'feed.html';
            });
        }
    }

    /**
     * Handle user logout
     */
    async handleLogout() {
        try {
            // Clear session
            this.sessionManager.clearSession();

            // Redirect to login/home page
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error during logout:', error);
            // Force redirect even if there's an error
            window.location.href = 'index.html';
        }
    }

    /**
     * Handle edit profile action (placeholder for future implementation)
     */
    handleEditProfile() {
        // This could open a modal or navigate to an edit page
        console.log('Edit profile clicked - functionality not yet implemented');
        // For now, just show an alert
        alert('Profile editing functionality coming soon!');
    }

    /**
     * Handle unauthenticated user
     */
    handleUnauthenticatedUser() {
        console.warn('User not authenticated, redirecting to login');
        // Redirect to login page
        window.location.href = 'index.html';
    }

    /**
     * Show loading state in the UI
     */
    showLoadingState() {
        // Update UI elements to show loading
        this.updateElement('username', 'Loading...');
        this.updateElement('email', 'Loading...');
        this.updateElement('student-number', 'Loading...');
        this.updateElement('post-count', '...');
        this.updateElement('comment-count', '...');
        this.updateElement('reputation', '...');
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        // Loading state is hidden when real data is populated
        // Could add loading spinners here if needed
    }

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showError(message) {
        console.error('Profile error:', message);

        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.zIndex = '9999';
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * Refresh profile data
     */
    async refreshProfile() {
        if (this.isLoading) return;

        console.log('Refreshing profile data...');
        await this.loadCurrentUserProfile();
    }

    /**
     * Get current profile data
     * @returns {Object|null} Current profile data
     */
    getCurrentProfile() {
        return this.currentProfile;
    }

    /**
     * Load profile for a specific user (for viewing other users' profiles)
     * @param {string} userId - User ID to load profile for
     */
    async loadUserProfile(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            this.isLoading = true;
            this.showLoadingState();

            const profile = await this.profileUtils.getUserProfile(userId);

            if (!profile) {
                throw new Error('User profile not found');
            }

            this.currentProfile = profile;
            await this.updateProfileUI(profile);
            this.hideLoadingState();

        } catch (error) {
            console.error('Error loading user profile:', error);
            this.showError(`Failed to load profile for user: ${userId}`);
        } finally {
            this.isLoading = false;
        }
    }
}