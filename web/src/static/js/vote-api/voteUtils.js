/**
 * Vote API utilities for handling upvotes and downvotes
 */

import { sessionManager } from "../managers/session-manager.js";

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
            body: JSON.stringify({ vote_type: voteType, user_id: userId })
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
        // Find the posts by the ID that the user has voted on
        const userId = sessionManager.getUserId();
        const postId = postIds.join(',');

        const response = await fetch(`${API_BASE_URL}/posts/${postId}/votes/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error getting user votes:', error);
        return {};
    }
}

/**
 * Format user vote data returned from API
 * @param {Array} userVotes - Array of vote objects from the API
 * @returns {Object} Object mapping post IDs to vote types
 */
export function formatUserVotes(userVotes) {
    const voteMap = {};

    if (Array.isArray(userVotes)) {
        userVotes.forEach(vote => {
            if (vote.PK && vote.PK.startsWith('POST#')) {
                // Extract post ID from the PK (format: "POST#<post_id>")
                const postId = vote.PK.split('#')[1];
                voteMap[postId] = vote.vote_type;
            }
        });
    }

    console.log('Formatted user votes:', voteMap);
    return voteMap;
}