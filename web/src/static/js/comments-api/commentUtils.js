import { BASE_API_URL } from "../utils/base-api-url.js";

/**
 * Format a raw comment object from the backend into a frontend-friendly
 * structure.
 */
export function formatComment(rawComment) {
    if (!rawComment) return null;

    return {
        id: rawComment.id,
        postId: rawComment.PK ? rawComment.PK.replace('POST#', '') : null,
        parentCommentId: rawComment.parent_comment_id || null,
        author: rawComment.author_id,
        content: rawComment.content,
        isAnonymous: rawComment.is_anonymous || false,
        upvotes: rawComment.upvotes || 0,
        downvotes: rawComment.downvotes || 0,
        createdAt: rawComment.created_at || null,
        updatedAt: rawComment.updated_at || null,
        isReply: !!rawComment.parent_comment_id
    };
}

/**
 * Validate comment data before sending to backend.
 * Ensures required fields are present and properly typed.
 */
export function validateCommentData(data) {
    const errors = [];

    if (!data.content || typeof data.content !== 'string') {
        errors.push('Content is required and must be a string.');
    }

    if (!data.author_id || typeof data.author_id !== 'string') {
        errors.push('Author ID is required.');
    }

    if (data.is_anonymous && typeof data.is_anonymous !== 'boolean') {
        errors.push('is_anonymous must be a boolean if provided.');
    }

    return errors;
}

/**
 * Prepare payload for creating or updating a comment.
 * Filters out undefined or null fields.
 */
export function buildCommentPayload(data) {
    const payload = {
        author_id: data.author_id,
        content: data.content,
        is_anonymous: !!data.is_anonymous
    };

    // Remove empty fields
    Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
            delete payload[key];
        }
    });

    return payload;
}

/**
 * Fetch all comments for a specific post
 */
export async function getComments(postId) {
    if (!postId || typeof postId !== 'string') {
        throw new Error(
            'Invalid postId: postId is required and must be a non-empty string.'
        );
    }

    let response;
    try {
        response = await fetch(`${BASE_API_URL}/posts/${postId}/comments`);
        if (!response.ok) throw new Error('Failed to fetch comments');
    } catch (err) {
        console.error('Error fetching comments:', err);
        return []; // Return empty array to avoid frontend crashes
    }

    const rawComments = await response.json();

    // Ensure we return an array
    if (!Array.isArray(rawComments)) {
        console.warn('getComments expected an array, got:', typeof rawComments);
        return [];
    }

    return rawComments.map(formatComment);
}

/**
 * Create a new comment on a post
 */
export async function createComment(postId, data) {
    if (!postId || typeof postId !== 'string') {
        throw new Error(
            'Invalid postId: postId is required and must be a non-empty string.'
        );
    }

    const validationErrors = validateCommentData(data);
    if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const payload = buildCommentPayload(data);
    const response = await fetch(`${BASE_API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to create comment');

    return formatComment(await response.json());
}

/**
 * Update an existing comment
 */
export async function updateComment(postId, commentId, data) {
    if (!postId || typeof postId !== 'string') {
        throw new Error(
            'Invalid postId: postId is required and must be a non-empty string.'
        );
    }

    if (!commentId || typeof commentId !== 'string') {
        throw new Error(
            `Invalid commentId:
            commentId is required and must be a non-empty string.`
        );
    }

    const validationErrors = validateCommentData(data);
    if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const payload = buildCommentPayload(data);
    const response = await fetch(
        `${BASE_API_URL}/posts/${postId}/comments/${commentId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) throw new Error('Failed to update comment');

    return formatComment(await response.json());
}

/**
 * Delete a comment
 */
export async function deleteComment(postId, commentId) {
    const response = await fetch(
        `${BASE_API_URL}/posts/${postId}/comments/${commentId}`,
        { method: 'DELETE' }
    );

    if (!response.ok) throw new Error('Failed to delete comment');

    return await response.json(); // Usually returns a success message
}

/**
 * Extract patchable fields from a form or UI input.
 * Useful for PATCH requests on comments.
 */
export function extractCommentPatchFields(data) {
    const allowedFields = ['content', 'is_anonymous'];
    const patch = {};

    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            patch[field] = data[field];
        }
    });

    return patch;
}

/**
 * Partially update a comment
 */
export async function patchComment(postId, commentId, fields) {
    const patchData = extractCommentPatchFields(fields);
    const response = await fetch(
        `${BASE_API_URL}/posts/${postId}/comments/${commentId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patchData),
        }
    );

    if (!response.ok) throw new Error('Failed to patch comment');

    return formatComment(await response.json());
}

/**
 * Get a specific comment by ID
 */
export async function getComment(postId, commentId) {
    const response = await fetch(
        `${BASE_API_URL}/posts/${postId}/comments/${commentId}`
    );

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error('Failed to fetch comment');
    }

    return formatComment(await response.json());
}

/**
 * Organize comments into a thread structure with replies nested under their
 * parents
 */
export function organizeCommentsThread(comments) {
    if (!Array.isArray(comments)) return [];

    const commentMap = {};
    const rootComments = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
        comment.replies = [];
        commentMap[comment.id] = comment;
    });

    // Second pass: nest replies under their parents
    comments.forEach(comment => {
        if (comment.parentCommentId) {
            const parent = commentMap[comment.parentCommentId];
            if (parent) {
                parent.replies.push(comment);
            }
        } else {
            rootComments.push(comment);
        }
    });

    return rootComments;
}

/**
 * Count the total number of comments (including replies) for a post
 */
export function countTotalComments(comments) {
    if (!Array.isArray(comments)) return 0;

    let count = 0;
    comments.forEach(comment => {
        count++; // Count the parent comment
        if (comment.replies && comment.replies.length > 0) {
            // Recursively count replies
            count += countTotalComments(comment.replies);
        }
    });

    return count;
}