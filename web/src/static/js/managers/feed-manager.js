import { getPosts } from '../post-api/postUtils.js';
import { getComments } from '../comments-api/commentUtils.js';
import { voteHandler } from '../vote-api/vote-handler.js';
import { ProfileUtils } from '../profile-api/profileUtils.js';
import { CommentModalHandler } from '../comments-api/comment-handler.js';
import { sessionManager } from '../managers/session-manager.js';

/**
 * Enhanced post template loader that connects to your post utilities
 */
class FeedManager {
    constructor() {
        this.posts = [];
        this.feedContainer = null;
    }

    async initialize(containerId) {
        try {
            this.feedContainer = document.querySelector(`.${containerId}`);
        } catch (error) {
            console.error('Feed container not found: ', error);
            return;
        }
    }

    /**
     * Load posts from API using your postUtils
     */
    async loadPosts() {
        try {
            // Use your getPosts utility function
            this.posts = await getPosts();

            // Clear existing posts and render new ones
            this.feedContainer.innerHTML = '';

            // Render all posts (using for loop to handle async properly)
            for (const post of this.posts) {
                await this.renderPost(post);
            }

            // Initialize vote states after all posts are rendered
            await voteHandler.initializeVoteStates(this.posts);
        } catch (error) {
            console.error('Failed to load posts:', error);
            this.showErrorMessage('Failed to load posts. Please try again.');
        }
    }

    /**
    * Refresh the post feed
    * refresh = false, true if the container will be cleared
    */
    async reloadPosts(newPosts = this.posts, refresh = false) {
        try {
            // Clear existing posts and render new ones
            if (refresh) {
                this.feedContainer.innerHTML = '';
            }

            // Render all posts (using for loop to handle async properly)
            for (const post of newPosts) {
                await this.renderPost(post);
            }

            // Initialize vote states after all posts are rendered
            await voteHandler.initializeVoteStates(newPosts);
        } catch (error) {
            console.error('Failed to load posts:', error);
            this.showErrorMessage('Failed to load posts. Please try again.');
        }
    }

    // Load user posts for profile page
    async loadUserPosts(posts) {
        try {
            this.posts = posts;
            this.feedContainer = document.querySelector('.user-posts-container');

            // Clear existing posts and render new ones
            this.feedContainer.innerHTML = '';

            // Render all posts (using for loop to handle async properly)
            for (const post of this.posts) {
                await this.renderPost(post, true);
            }

            // Initialize vote states after all posts are rendered
            await voteHandler.initializeVoteStates(this.posts);
        } catch (error) {
            console.error('Failed to load user posts:', error);
            this.showErrorMessage('Failed to load your posts. Please try again.');
        }
    }

    /**
     * Render a single post using the template
     */
    async renderPost(postData, isAuthor = false) {
        try {
            // Load the template
            const response = await fetch('./post-template.html');
            const template = await response.text();

            // Replace template variables
            const filledPost = this.fillTemplate(template, postData);

            // Create DOM element
            const postElement = document.createElement('div');
            postElement.innerHTML = filledPost;
            postElement.dataset.postId = postData.id;

            this.feedContainer.appendChild(postElement.firstElementChild);
            const actualPostElement = this.feedContainer.lastElementChild;

            // Add AI summary button after element is in DOM
            if (postData.attachments && postData.attachments.length > 0) {
                this.addSummaryButton(actualPostElement, postData);
            }

            // Hide edit and delete buttons for non-authors
            if (!isAuthor) {
                $(actualPostElement).find(".post-actions").hide();
            }

            // Load comments for this post
            await this.loadCommentsForPost(postData.id, actualPostElement);
        } catch (error) {
            console.error('Failed to render post:', error);
        }
    }

    // Add AI summary button to post element
    addSummaryButton(postElement, postData) {
        const summarizeBtn = $(postElement).find(".ai-summary-btn");
        summarizeBtn.css("display", "inline-block");
        summarizeBtn.on("click", function () {
            console.log("Summarizing post:", postData.id);
            const summaryContainer = $(postElement).find(".ai-summary-container");

            // Prevent duplicate summary - check if summary content already exists
            // Check if there's any actual content (not just whitespace/comments)
            if (summaryContainer.children().length === 0) {
                summaryContainer.html(`
                    <hr>
                    <div class="summary-content">
                        <i class="bi bi-robot"></i>
                        <strong>Summary: </strong>
                        <p>${postData.summary || 'No summary available'}</p>
                    </div>
                `);
            }
        });
    }

    /**
     * Fill template with data
     */
    fillTemplate(template, data) {
        let filledTemplate = template
            .replace(/\{\{id\}\}/g, data.id)
            .replace(/\{\{username\}\}/g, data.author === sessionManager.getUserName() ? "Me" : data.author)
            .replace(/\{\{title\}\}/g, data.title)
            .replace(/\{\{content\}\}/g, data.content)
            .replace(/\{\{tags\}\}/g, data.tags.join(', '))
            .replace(/\{\{timeAgo\}\}/g, data.createdAt ? this.formatTimeAgo(data.createdAt) : 'Unknown')
            .replace(/\{\{summary\}\}/g, data.summary || '')
            .replace(/\{\{attachments\}\}/g, this.generateAttachmentHTML(data.attachments || []));

        return filledTemplate;
    }

    generateAttachmentHTML(attachments) {
        if (!attachments.length) return '<div></div>';
        let html = `<div class="attachment-list"><strong>📎 Attachments:</strong><ul>`;
        attachments.forEach(file => {
            const fileName = file.substring(file.lastIndexOf('/') + 1);
            html += `
            <li class="attachment-item">
                <span class="filename">${fileName}</span>
                <a class="download-btn" href="${file}" download>
                <i class="bi bi-download"></i>
                </a>
            </li>`;
        });
        html += `</ul></div>`;

        return html;
    }

    /**
     * Load comments for a specific post
     */
    async loadCommentsForPost(postId, postElement) {
        try {
            const comments = await getComments(postId);
            comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
            const commentsContainer = postElement.querySelector('.comments-container');

            if (commentsContainer && comments.length > 0) {
                // Clear existing comments
                commentsContainer.innerHTML = '';

                // Render each comment
                comments.forEach(comment => {
                    this.loadCommentTemplate(comment, commentsContainer);
                });
            } else {
                console.log('No comments container found or no comments to display');
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    }

    loadCommentTemplate(commentData, targetContainer) {
        console.log('Loading comment template with data:', commentData);
        $.get("./comment-template.html")
            .done(function (template) {
                console.log('Comment template loaded successfully');
                // For comments, if the author is the current user, use their name from session
                // Otherwise, use the author field (which might be user ID for now)
                let displayName = commentData.author;
                if (sessionManager && sessionManager.getUserName() === commentData.author) {
                    displayName = "Me";
                }

                const filled = template
                .replace("{{commenter}}", displayName)
                .replace("{{commentText}}", commentData.content)
                .replace("{{timeAgo}}", this.formatTimeAgo(commentData.updatedAt || commentData.createdAt));

                console.log('Comment template filled:', filled);
                $(targetContainer).append(filled);
            }.bind(this))
            .fail(function(error) {
                console.error('Failed to load comment template:', error);
            });
    }

    /**
     * Format timestamp to "time ago" format
     */
    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Unknown';

        const now = new Date();
        const postTime = new Date(timestamp);
        const diffMs = now - postTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    /**
     * Show error message to user
     */
    showErrorMessage(message) {
        // You can implement a toast notification or inline error display
        console.error(message);
    }

    /**
     * Refresh the entire feed
     */
    async refresh() {
        await this.loadPosts();
    }
}

// Global feed manager instance
export const feedManager = new FeedManager();
