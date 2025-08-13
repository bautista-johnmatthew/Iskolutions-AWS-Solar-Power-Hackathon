import { BASE_API_URL } from "../utils/base-api-url.js";
import { sessionManager } from "../managers/session-manager.js";

/**
 * ProfileUtils - A utility class for retrieving and managing user profile data
 */
class ProfileUtils {
    constructor() {
        this.baseUrl = BASE_API_URL;
        this.sessionManager = sessionManager;
    }

    /**
     * Format a raw user object from the backend into a frontend-friendly structure.
     * @param {Object} rawUser - Raw user data from backend
     * @returns {Object} Formatted user profile object
     */
    formatUserProfile(rawUser) {
        if (!rawUser) return null;

        return {
            userId: rawUser.user_id || rawUser.id,
            username: rawUser.username,
            email: rawUser.email,
            studentNumber: rawUser.student_id,
            role: rawUser.role,
            isVerified: rawUser.is_verified || false,
            createdAt: rawUser.created_at || null,
            updatedAt: rawUser.updated_at || null,
            // These will be calculated separately
            postsCount: 0,
            commentsCount: 0,
            reputationScore: 0,
            posts: []
        };
    }

    /**
     * Get user profile by user ID
     * Since there's no /users/ route, we'll work with session data and calculate aggregated info
     * @param {string} userId - User ID to fetch profile for
     * @returns {Promise<Object|null>} User profile object or null if not found
     */
    async getUserProfile(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            // Since there's no /users/ endpoint, we need to construct the profile from available data
            // Check if this is the current user from session
            const currentUser = this.sessionManager.getUser();

            if (currentUser && currentUser.id === userId) {
                // Return current user's profile from session with aggregated data
                return await this.getCurrentUserProfile();
            }

            // For other users, we can only get basic info from their posts/comments
            // This is a limitation without a dedicated users endpoint
            const userPosts = await this.getUserPosts(userId);

            if (userPosts.length === 0) {
                return null; // User not found or has no posts
            }

            // Extract basic info from posts (limited data available)
            const basicProfile = {
                userId: userId,
                username: "Unknown User", // Cannot get username without user endpoint
                email: null, // Cannot get email without user endpoint
                studentNumber: null, // Cannot get student number without user endpoint
                role: null, // Cannot get role without user endpoint
                isVerified: false,
                createdAt: null,
                updatedAt: null,
                postsCount: userPosts.length,
                commentsCount: await this.getUserCommentsCount(userId),
                reputationScore: await this.getUserReputation(userId),
                posts: userPosts
            };

            return basicProfile;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    /**
     * Get current user's profile (from session)
     * @returns {Promise<Object|null>} Current user's profile with aggregated data
     */
    async getCurrentUserProfile() {
        const currentUser = this.sessionManager.getUser();

        if (!currentUser) {
            throw new Error('No authenticated user found');
        }

        try {
            // Use session data to build profile (session structure: id, email, name, token)
            const profile = {
                userId: currentUser.id,
                username: currentUser.name, // session uses 'name' for username
                email: currentUser.email,
                studentNumber: null, // Not available in session, would need backend lookup
                role: null, // Not available in session, would need backend lookup
                isVerified: true, // Assume verified if they have a valid session
                createdAt: null, // Not available in session
                updatedAt: null, // Not available in session
                postsCount: 0,
                commentsCount: 0,
                reputationScore: 0,
                posts: []
            };

            // Get aggregated data
            const [posts, reputation] = await Promise.all([
                this.getUserPosts(currentUser.name),
                this.getUserReputation(currentUser.name)
            ]);

            // Calculate aggregated statistics
            profile.posts = posts;
            profile.postsCount = posts.length;
            profile.commentsCount = await this.getUserCommentsCount(currentUser.name);
            profile.reputationScore = reputation;

            return profile;
        } catch (error) {
            console.error('Error fetching current user profile:', error);
            throw error;
        }
    }

    /**
     * Get posts created by a specific user
     * @param {string} userId - User ID to fetch posts for
     * @returns {Promise<Array>} Array of user's posts
     */
    async getUserPosts(userName) {
        if (!userName) {
            throw new Error('User name is required');
        }

        try {
            // This would require filtering posts by author_id
            // We'll need to scan all posts and filter by author_id
            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch posts: ${response.statusText}`);
            }

            const allPosts = await response.json();

            // Filter posts by author_id
            const userPosts = allPosts.filter(post => post.author_id === userName);

            return userPosts.map(post => ({
                id: post.post_id || post.id,
                author: post.author_id,
                title: post.title,
                content: post.content,
                tags: post.tags || [],
                attachments: post.attachments || [],
                isAnonymous: post.is_anonymous || false,
                upvotes: post.upvotes || 0,
                downvotes: post.downvotes || 0,
                createdAt: post.created_at,
                updatedAt: post.updated_at
            }));
        } catch (error) {
            console.error('Error fetching user posts:', error);
            throw error;
        }
    }

    /**
     * Get the count of comments made by a specific user
     * @param {string} userId - User ID to count comments for
     * @returns {Promise<number>} Number of comments made by user
     */
    async getUserCommentsCount(userName) {
        if (!userName) {
            throw new Error('User name is required');
        }

        try {
            // This would require scanning all comments across all posts
            // For now, we'll need to implement a backend endpoint for this
            // As a workaround, we'll scan all posts and their comments
            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch posts for comment counting: ${response.statusText}`);
            }

            const allPosts = await response.json();
            const userPosts = allPosts.filter(post => post.author_id === userName);
            let totalComments = 0;

            // For each post, get comments and count those by the user
            for (const post of userPosts) {
                try {
                    const commentsResponse = await fetch(`${this.baseUrl}/posts/${post.post_id || post.id}/comments`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (commentsResponse.ok) {
                        const comments = await commentsResponse.json();
                        totalComments += comments.filter(comment => comment.author_id === userName).length;
                    }
                } catch (error) {
                    console.warn(`Failed to fetch comments for post ${post.post_id || post.id}:`, error);
                    // Continue with other posts
                }
            }

            return totalComments;
        } catch (error) {
            console.error('Error counting user comments:', error);
            throw error;
        }
    }

    /**
     * Calculate user's reputation score (upvotes - downvotes across all posts)
     * @param {string} userId - User ID to calculate reputation for
     * @returns {Promise<number>} User's reputation score
     */
    async getUserReputation(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const userPosts = await this.getUserPosts(userId);

            // Calculate total upvotes and downvotes across all user's posts
            const reputation = userPosts.reduce((total, post) => {
                return total + (post.upvotes || 0) - (post.downvotes || 0);
            }, 0);

            return reputation;
        } catch (error) {
            console.error('Error calculating user reputation:', error);
            throw error;
        }
    }

    /**
     * Get user profile by username
     * Since there's no /users/ route, this will scan posts to find a user by checking author info
     * @param {string} username - Username to fetch profile for
     * @returns {Promise<Object|null>} User profile object or null if not found
     */
    async getUserProfileByUsername(username) {
        if (!username) {
            throw new Error('Username is required');
        }

        try {
            // Check if this is the current user
            const currentUser = this.sessionManager.getUser();
            if (currentUser && currentUser.name === username) {
                return await this.getCurrentUserProfile();
            }

            // Since there's no /users/username/ endpoint, we'll need to scan posts
            // to find a user by their username (this is inefficient but necessary)
            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch posts: ${response.statusText}`);
            }

            const allPosts = await response.json();

            // Try to find the user ID by looking for posts with matching author
            // Note: This won't work unless posts contain author username, which they might not
            let userId = null;

            // If posts don't contain username info, we can't find the user this way
            // This is a limitation of not having a users endpoint
            console.warn('getUserProfileByUsername: Limited functionality without /users/ endpoint');

            return null; // Cannot reliably find user by username without proper endpoint
        } catch (error) {
            console.error('Error fetching user profile by username:', error);
            throw error;
        }
    }

    /**
     * Get user statistics summary
     * @param {string} userId - User ID to get statistics for
     * @returns {Promise<Object>} User statistics object
     */
    async getUserStatistics(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const [postsCount, commentsCount, reputation] = await Promise.all([
                this.getUserPosts(userId).then(posts => posts.length),
                this.getUserCommentsCount(userId),
                this.getUserReputation(userId)
            ]);

            return {
                postsCount,
                commentsCount,
                reputationScore: reputation,
                totalActivity: postsCount + commentsCount
            };
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            throw error;
        }
    }

    /**
     * Update user profile information
     * Since there's no /users/ endpoint, this is not possible with current backend
     * @param {string} userId - User ID to update
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated user profile
     */
    async updateUserProfile(userId, updateData) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            throw new Error('Update data is required');
        }

        const token = this.sessionManager.getToken();
        if (!token) {
            throw new Error('Authentication required to update profile');
        }

        // Since there's no /users/ endpoint for updating profiles,
        // we cannot implement this functionality with the current backend
        throw new Error('Profile updates not supported: No /users/ endpoint available in backend');
    }

    /**
     * Search users by username or email
     * Since there's no /users/ endpoint, this functionality is not available
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of matching user profiles
     */
    async searchUsers(query) {
        if (!query || query.trim().length === 0) {
            throw new Error('Search query is required');
        }

        // Since there's no /users/search endpoint, we cannot implement user search
        // This would require a dedicated backend endpoint
        throw new Error('User search not supported: No /users/ endpoint available in backend');
    }

    /**
     * Get comments for a specific post
     * @param {string} postId - Post ID to fetch comments for
     * @returns {Promise<Array>} Array of comments for the post
     */
    async getPostComments(postId) {
        if (!postId) {
            throw new Error('Post ID is required');
        }

        try {
            const response = await fetch(`${this.baseUrl}/posts/${postId}/comments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Post not found or no comments
                    return [];
                }
                throw new Error(`Failed to fetch comments: ${response.statusText}`);
            }

            const comments = await response.json();

            // Format comments for consistency
            return comments.map(comment => ({
                id: comment.comment_id || comment.id,
                content: comment.content || comment.text,
                author_id: comment.author_id,
                author_name: comment.author_name || comment.username,
                created_at: comment.created_at || comment.createdAt,
                updated_at: comment.updated_at || comment.updatedAt,
                post_id: comment.post_id || postId
            }));

        } catch (error) {
            console.error('Error fetching post comments:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance of the ProfileUtils class
const profileUtils = new ProfileUtils();

// Export the instance as default
export default profileUtils;

// Also export the class itself for direct instantiation if needed
export { ProfileUtils };
