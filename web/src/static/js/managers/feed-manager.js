import { getPosts } from '../post-api/postUtils.js';
import { getComments } from '../comments-api/commentUtils.js';
import { postActionsHandler } from '../post-api/post-actions-handler.js';
import { voteHandler } from '../vote-api/vote-handler.js';
import { sessionManager } from '../auth/session-manager-vanilla.js';

/**
 * Enhanced post template loader that connects to your post utilities
 */
class FeedManager {
    constructor() {
        this.posts = [];
        this.feedContainer = null;
    }

    async initialize() {
        try {
            this.feedContainer = document.querySelector('.feed-container');
        } catch (error) {
            console.error('Feed container not found: ', error);
            return;
        }

        await this.loadPosts();
        // Post actions handler is automatically initialized when imported
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
     * Render a single post using the template
     */
    async renderPost(postData) {
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

            // Add AI summary button
            if (postData.summary) {
                this.addSummaryButton(postElement, postData);
            }

            // Add to feed
            this.feedContainer.appendChild(postElement.firstElementChild);

            // Load comments for this post
            await this.loadCommentsForPost(postData.id, postElement);
        } catch (error) {
            console.error('Failed to render post:', error);
        }
    }

    // Add AI summary button to post element
    addSummaryButton(postElement, postData) {
        const summarizeBtn = $(postElement).find(".ai-summary-btn");
        summarizeBtn.css("display", "inline-block");
        summarizeBtn.on("click", function () {
            const postFooter = $(postElement).find(".post-footer");

            // Prevent duplicate summary
            if ($(postElement).find(".summary-content").length === 0) {
                postFooter.append(`
                    <hr>
                    <div class="summary-content">
                    <i class="bi bi-robot"></i>
                    <strong>Summary:</strong>
                    <p>${postData.summary}</p>
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
            .replace(/\{\{username\}\}/g, data.author)
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
            html += `
            <li class="attachment-item">
                <span class="filename">${file.name}</span>
                <a class="download-btn" href="${file.url}" download>
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
            const commentsContainer = postElement.querySelector('.comments-container');

            if (commentsContainer && comments.length > 0) {
                // Clear existing comments
                commentsContainer.innerHTML = '';

                // Render each comment
                comments.forEach(comment => {
                    this.loadCommentTemplate(comment, commentsContainer);
                });
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    }

    loadCommentTemplate(commentData, targetContainer) {
        $.get("comment-template.html", function (template) {
            const filled = template
            .replace("{{commenter}}", commentData.username)
            .replace("{{commentText}}", commentData.text)
            .replace("{{timeAgo}}", commentData.timeAgo);

            targetContainer.append(filled);
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
