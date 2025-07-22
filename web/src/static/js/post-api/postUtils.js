import { BASE_API_URL } from "../utils/base-api-url.js";
import { sessionManager } from "../auth/session-manager-vanilla.js";
/**
 * Format a raw post object from the backend into a frontend-friendly structure.
 * Useful for rendering posts in UI components.
 */
export function formatPost(rawPost) {
	if (!rawPost) return null;

	return {
		id: rawPost.post_id || rawPost.id,
		author: rawPost.author_id,
		title: rawPost.title,
		content: rawPost.content,
		tags: rawPost.tags || [],
		attachments: rawPost.attachments || [],
		isAnonymous: rawPost.is_anonymous || false,
		createdAt: rawPost.created_at || null,
		updatedAt: rawPost.updated_at || null,
	};
}

/**
 * Validate post data before sending to backend.
 * Ensures required fields are present and properly typed.
 */
export function validatePostData(data) {
	const errors = [];

	if (!data.title || typeof data.title !== 'string') {
		errors.push('Title is required and must be a string.');
	}

	if (!data.content || typeof data.content !== 'string') {
		errors.push('Content is required and must be a string.');
	}

	if (!data.author_id || typeof data.author_id !== 'string') {
		errors.push('Author ID is required.');
	}

	if (data.tags && !Array.isArray(data.tags)) {
		errors.push('Tags must be an array.');
	}

	if (data.attachments && !Array.isArray(data.attachments)) {
		errors.push('Attachments must be an array.');
	}

	return errors;
}

export async function getPosts() {
	let response;
    try {
        response = await fetch(`${BASE_API_URL}/posts`);
        if (!response.ok) throw new Error('Failed to fetch posts');
    } catch (err) {
        console.error('Error fetching posts:', err);
        return []; // Return empty array to avoid frontend crashes
    }

	const rawPosts = await response.json();

	// Ensure we return an array
	if (!Array.isArray(rawPosts)) {
		console.warn('getPosts expected an array, got:', typeof rawPosts);
		return [];
	}

	return rawPosts.map(formatPost);
}


/**
 * Prepare payload for creating or updating a post.
 * Filters out undefined or null fields.
 */
export function buildPostPayload(data) {
	const payload = {
		author_id: data.author_id,
		title: data.title,
		content: data.content,
		tags: data.tags || [],
		attachments: data.attachments || [],
		is_anonymous: !!data.is_anonymous,
	};

	// Remove empty fields
	Object.keys(payload).forEach(key => {
		if (payload[key] === undefined || payload[key] === null) {
			delete payload[key];
		}
	});

	return payload;
}

export async function createPost(data) {
    // Ensure user is authenticated
    const isLoggedIn = sessionManager.isLoggedIn();
    if (!isLoggedIn) {
        throw new Error('User must be authenticated to create a post');
    }
    
// Removed redundant author_id assignment as it is already set in addpost.js
    
    const validationErrors = validatePostData(data);
    if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
	
    const payload = buildPostPayload(data);
    
    // Get token for authentication if available
    const token = sessionManager.getToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    
    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${BASE_API_URL}/posts`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
    });
	
    if (!response.ok) throw new Error('Failed to create post');
	
    return await response.json();
}

export async function updatePost(postId, data) {
    if (!postId || typeof postId !== 'string') {
        throw new Error('Invalid postId: postId is required and must be a non-empty string.');
    }

    const validationErrors = validatePostData(data);
    if (validationErrors.length > 0) {
        throw new Error(`Invalid data: ${validationErrors.join(' ')}`);
    }
	
    const payload = buildPostPayload(data);
    const response = await fetch(`${BASE_API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
	
    if (!response.ok) throw new Error('Failed to update post');
	
    return await response.json();
}

export async function deletePost(postId) {
    const response = await fetch(`${BASE_API_URL}/posts/${postId}`, {
        method: 'DELETE',
    });
	
    if (!response.ok) throw new Error('Failed to delete post');
	
    return await response.json(); // Usually returns a success message
}

/**
 * Extract patchable fields from a form or UI input.
 * Useful for PATCH requests.
 */
export function extractPatchFields(data) {
	const allowedFields = ['title', 'content', 'tags', 'attachments'];
	const patch = {};

	allowedFields.forEach(field => {
		if (data[field] !== undefined) {
			patch[field] = data[field];
		}
	});

	return patch;
}

export async function patchPost(postId, fields) {
    const patchData = extractPatchFields(fields);
    const response = await fetch(`${BASE_API_URL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchData),
    });
	
    if (!response.ok) throw new Error('Failed to patch post');
	
    return await response.json();
}

function similarityScore(a, b) {
  const maxLen = Math.max(a.length, b.length);
  const distance = levenshtein(a, b);
  return 1 - distance / maxLen; // closer to 1 = more similar
}

/**
 * Compute Levenshtein distance between two strings.
 * Used for fuzzy matching.
 */
function levenshtein(a, b) {
	const matrix = Array.from({ length: b.length + 1 }, (_, innerBound) =>
		Array.from({ length: a.length + 1 }, (_, outerBound) => (
			innerBound === 0
				? outerBound
				: outerBound === 0
					? innerBound
					: 0
		))
	);

	for (let innerBound = 1; innerBound <= b.length; innerBound++) {
		for (let outerBound = 1; outerBound <= a.length; outerBound++) {
			const cost = a[outerBound - 1] === b[innerBound - 1] ? 0 : 1;
			matrix[innerBound][outerBound] = Math.min(
				matrix[innerBound - 1][outerBound] + 1,      	// deletion
				matrix[innerBound][outerBound - 1] + 1,       	// insertion
				matrix[innerBound - 1][outerBound - 1] + cost 	// substitution
			);
		}
	}

	return matrix[b.length][a.length];
}

/**
 * Fuzzy search and sort posts by title relevance.
 * Uses normalized Levenshtein similarity score.
 * @param {Array} posts - List of formatted posts.
 * @param {string} keyword - Search term.
 * @param {number} threshold - Minimum similarity (0–1). Default is 0.7.
 * @returns {Array} Matched posts, sorted by score descending.
 */
export function fuzzySearchPosts(posts, keyword, threshold = 0.3) {
    if (!Array.isArray(posts)) {
        console.warn('Expected an array of posts. Got:', typeof posts);
        return [];
    }

    const lowerKeyword = keyword.trim().toLowerCase();

    const scoredPosts = posts.map(post => {
        const title = post.title?.toLowerCase() || '';
        const score = similarityScore(title, lowerKeyword);
        return { post, score };
    }).filter(({ score }) => score >= threshold);

    // Sort by score descending (highest match first)
    scoredPosts.sort((a, b) => b.score - a.score);

    // Return just the posts
    return scoredPosts.map(({ post }) => post);
}
