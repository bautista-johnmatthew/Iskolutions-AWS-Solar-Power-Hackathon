/**
 * Vote API utilities for handling upvotes and downvotes
 */

import { sessionManager } from "../auth/session-manager-vanilla.js";

const API_BASE_URL = 'http://localhost:8000'; // Adjust this to your API URL

/**
 * Vote on a post
 * @param {string} postId - The ID of the post to vote on
 * @param {string} voteType - Either 'up' or 'down'
 * @returns {Promise<Object>} Response from the API
 */
export async function votePost(postId, voteType, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vote_type: voteType, user_id: userId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error voting on post:', error);
        throw error;
    }
}

/**
 * Remove vote from a post
 * @param {string} postId - The ID of the post to remove vote from
 * @param {string} voteType - Either 'up' or 'down'
 * @returns {Promise<Object>} Response from the API
 */
export async function removePostVote(postId, voteType, userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/vote`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vote_type: voteType, user_id: userId})
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing vote from post:', error);
        throw error;
    }
}

/**
 * Toggle vote on a post (handles logic of voting/removing vote)
 * @param {string} postId - The ID of the post
 * @param {string} voteType - Either 'up' or 'down'
 * @param {boolean} isCurrentlyVoted - Whether user has already voted this way
 * @returns {Promise<Object>} Response from the API
 */
export async function togglePostVote(postId, voteType, isCurrentlyVoted = false) {
    if (isCurrentlyVoted) {
        return await removePostVote(postId, voteType, sessionManager.getUserId());
    } else {
        return await votePost(postId, voteType, sessionManager.getUserId());
    }
}

/**
 * Get user's current votes for posts
 * @param {Array} postIds - Array of post IDs to check votes for
 * @returns {Promise<Object>} Object mapping post IDs to vote types
 */
export async function getUserPostVotes(postIds) {
    try {
        // For now, we'll simulate this since there might not be a dedicated endpoint
        // In a real implementation, you'd call an API endpoint like:
        // const response = await fetch(`${API_BASE_URL}/users/me/votes/posts`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ post_ids: postIds })
        // });

        // Temporary mock - replace with actual API call when available
        return {};
    } catch (error) {
        console.error('Error getting user votes:', error);
        return {};
    }
}

/**
 * Get user's current votes for comments
 * @param {Array} commentIds - Array of comment IDs to check votes for
 * @returns {Promise<Object>} Object mapping comment IDs to vote types
 */
export async function getUserCommentVotes(commentIds) {
    try {
        // Similar to above - placeholder for actual implementation
        return {};
    } catch (error) {
        console.error('Error getting user comment votes:', error);
        return {};
    }
}
