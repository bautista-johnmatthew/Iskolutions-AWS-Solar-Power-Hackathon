import { sessionManager } from '../managers/session-manager.js';
import { createComment } from './commentUtils.js';
import { feedManager } from '../managers/feed-manager.js';
import { validateField } from '../validation/schema.js';

/**
 * Comment Modal Handler - Creates and manages the custom comment modal
 * Replaces Bootstrap modal with custom implementation that matches post modal design
 */
export class CommentModalHandler {
    constructor() {
        this.isModalOpen = false;
        this.currentPostId = null;
        this.currentPostWrapper = null;
        this.setupGlobalEventListeners();
    }

    /**
     * Setup event listeners for comment buttons
     */
    setupGlobalEventListeners() {
        document.addEventListener('click', (e) => {
            console.log("Global click event:", e.target);
            // Check if it's an add comment button
            if (e.target.classList.contains('add-comment-btn')) {
                e.preventDefault();

                // Check if user is logged in
                if (!sessionManager.isLoggedIn()) {
                    this.showLoginRequiredMessage();
                    return;
                }

                const postWrapper = e.target.closest('.post-wrapper');
                if (postWrapper) {
                    const postId = postWrapper.dataset.postId;
                    this.openCommentModal(postId, postWrapper);
                }
            }
        });

        // Handle escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closeCommentModal();
            }
        });
    }

    /**
     * Open the comment modal for a specific post
     */
    openCommentModal(postId, postWrapper) {
        this.currentPostId = postId;
        this.currentPostWrapper = postWrapper;

        // Create modal HTML
        const modalHTML = this.createModalHTML();

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal with animation
        const overlay = document.getElementById('commentModalOverlay');
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);

        this.isModalOpen = true;
        this.setupModalEventListeners();
    }

    /**
     * Create the modal HTML structure
     */
    createModalHTML() {
        return `
            <div class="comment-modal-overlay" id="commentModalOverlay">
                <div class="comment-modal">
                    <div class="comment-modal-header">
                        <h2 class="comment-modal-title">ADD COMMENT</h2>
                    </div>
                    <hr class="comment-modal-divider" />
                    <form id="commentForm">
                        <div class="comment-modal-body">
                            <div style="margin-bottom: 20px;">
                                <label class="form-label">COMMENT<span style="color: red">*</span></label>
                                <textarea id="commentContent" class="comment-textarea" rows="6" placeholder="WRITE YOUR COMMENT HERE..." required maxlength="2000"></textarea>
                                <div class="comment-error-message" id="commentContentError"></div>
                            </div>
                        </div>

                        <div class="comment-modal-footer">
                            <div class="comment-error-message" id="commentOverallError"></div>
                            <button type="button" class="footer-btn cancel-btn" id="cancelComment">CANCEL</button>
                            <button type="submit" class="footer-btn post-btn" id="submitComment">COMMENT</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners for modal elements
     */
    setupModalEventListeners() {
        const form = document.getElementById('commentForm');
        const cancelBtn = document.getElementById('cancelComment');
        const overlay = document.getElementById('commentModalOverlay');
        const textarea = document.getElementById('commentContent');

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCommentSubmission();
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            this.closeCommentModal();
        });

        // Click outside modal to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeCommentModal();
            }
        });

        // Real-time character count and validation
        textarea.addEventListener('input', () => {
            this.validateCommentContent();
        });

        textarea.addEventListener('blur', () => {
            this.validateCommentContent();
        });
    }

    /**
     * Validate comment content using the schema
     */
    validateCommentContent() {
        const textarea = document.getElementById('commentContent');
        const content = textarea.value.trim();

        this.clearError('commentContentError');

        try {
            const validationResult = validateField('comment', { content: content });

            if (!validationResult.isValid) {
                // Extract the first error message
                const errorMessage = Array.isArray(validationResult.error) && validationResult.error.length > 0
                    ? validationResult.error[0].message
                    : 'Invalid comment content';
                this.showError('commentContentError', errorMessage);
                return false;
            }

            return true;
        } catch (error) {
            this.showError('commentContentError', 'Validation error occurred.');
            return false;
        }
    }

    /**
     * Handle comment form submission
     */
    async handleCommentSubmission() {
        try {
            // Clear previous errors
            this.clearError('commentOverallError');

            // Validate form
            const isValid = this.validateCommentContent();
            if (!isValid) {
                return;
            }

            // Get form data
            const content = document.getElementById('commentContent').value.trim();
            const author = sessionManager.getUserName();

            if (!author) {
                this.showError('commentOverallError', 'You must be logged in to comment.');
                return;
            }

            // Disable submit button
            const submitBtn = document.getElementById('submitComment');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'POSTING...';

            // Create comment data
            const commentData = {
                content: content,
                author_id: author,
            };

            // Submit to backend
            console.log('Submitting comment:', commentData, 'for post:', this.currentPostId);
            await createComment(this.currentPostId, commentData);
            console.log('Comment created successfully');

            // Success - close modal and refresh comments
            this.closeCommentModal();

            // Reload comments for this post
            if (this.currentPostWrapper && feedManager) {
                console.log('Reloading comments for post wrapper:', this.currentPostWrapper);
                await feedManager.loadCommentsForPost(this.currentPostId, this.currentPostWrapper);
            } else {
                console.warn('Missing postWrapper or feedManager:', {
                    postWrapper: this.currentPostWrapper,
                    feedManager: feedManager
                });
            }

            this.showSuccessMessage('Comment added successfully!');

        } catch (error) {
            console.error('Failed to create comment:', error);
            this.showError('commentOverallError', error.message || 'Failed to add comment. Please try again.');

            // Re-enable submit button
            const submitBtn = document.getElementById('submitComment');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'COMMENT';
            }
        }
    }

    /**
     * Close the comment modal
     */
    closeCommentModal() {
        const overlay = document.getElementById('commentModalOverlay');
        if (overlay) {
            overlay.classList.remove('show');

            // Remove from DOM after animation
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }

        this.isModalOpen = false;
        this.currentPostId = null;
        this.currentPostWrapper = null;
    }

    /**
     * Show error message
     */
    showError(elementId, message) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    /**
     * Clear error message
     */
    clearError(elementId) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed';
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 15px;
            border-radius: 8px;
            background-color: #28a745;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    /**
     * Show login required message
     */
    showLoginRequiredMessage() {
        // Create temporary warning notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-warning position-fixed';
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 15px;
            border-radius: 8px;
            background-color: #ffc107;
            color: #856404;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = 'You must be logged in to add comments.';

        document.body.appendChild(notification);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
}

// Export singleton instance
export const commentModalHandler = new CommentModalHandler();
