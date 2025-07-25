import { updatePost, deletePost, patchPost } from './postUtils.js';
import { createComment } from '../comments-api/commentUtils.js';
import { feedManager } from '../managers/feed-manager.js';
import { voteHandler } from '../vote-api/vote-handler.js';

/**
 * Handles all post-related actions (edit, delete, vote, etc.)
 */
export class PostActionsHandler {
    constructor() {
        this.setupGlobalEventListeners();
    }

    /**
     * Setup event listeners using event delegation for dynamically added posts
     */
    setupGlobalEventListeners() {
        document.addEventListener('click', (e) => {
            const postWrapper = e.target.closest('.post-wrapper');
            if (!postWrapper) return;

            const postId = postWrapper.dataset.postId;

            if (e.target.classList.contains('edit-post-btn')) {
                this.handleEditPost(postId, postWrapper);
            } else if (e.target.classList.contains('delete-post-btn')) {
                this.handleDeletePost(postId);
            } else if (e.target.classList.contains('add-comment-btn')) {
                this.handleAddComment(postId, postWrapper);
            } else if (e.target.closest('.vote-btn')) {
                const voteBtn = e.target.closest('.vote-btn');
                const voteType = voteBtn.dataset.voteType;
                this.handleVote(postId, voteType, voteBtn);
            }
        });
    }

    /**
     * Handle post editing - opens an edit modal or inline editor
     */
    async handleEditPost(postId, postWrapper) {
        try {
            // Get current post data from the DOM
            const currentTitle = postWrapper.querySelector('.post-title').textContent;
            const currentContent = postWrapper.querySelector('.post-text').textContent;
            const currentTags = postWrapper.querySelector('.tag').textContent.split(', ');

            // You can create a modal or inline editor here
            const editData = await this.showEditModal({
                id: postId,
                title: currentTitle,
                content: currentContent,
                tags: currentTags
            });

            if (editData) {
                // Use your patchPost utility to update only changed fields
                await patchPost(postId, editData);

                // Refresh the feed to show updated post
                feedManager.refresh();

                this.showSuccessMessage('Post updated successfully!');
            }
        } catch (error) {
            console.error('Failed to edit post:', error);
            this.showErrorMessage('Failed to update post. Please try again.');
        }
    }

    /**
     * Handle post deletion
     */
    async handleDeletePost(postId) {
        const confirmed = await this.showConfirmDialog(
            'Delete Post',
            'Are you sure you want to delete this post? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                await deletePost(postId);
                feedManager.refresh();
                this.showSuccessMessage('Post deleted successfully!');
            } catch (error) {
                console.error('Failed to delete post:', error);
                this.showErrorMessage('Failed to delete post. Please try again.');
            }
        }
    }

    /**
     * Handle adding a new comment
     */
    async handleAddComment(postId, postWrapper) {
        const commentText = await this.showCommentModal();

        if (commentText) {
            try {
                const commentData = {
                    content: commentText,
                    is_anonymous: false // You can add checkbox for this
                };

                await createComment(postId, commentData);

                // Reload comments for this specific post
                await feedManager.loadCommentsForPost(postId, postWrapper);

                this.showSuccessMessage('Comment added successfully!');
            } catch (error) {
                console.error('Failed to add comment:', error);
                this.showErrorMessage('Failed to add comment. Please try again.');
            }
        }
    }

    /**
     * Show edit modal - This should be replaced with actual modal implementation
     */
    async showEditModal(postData) {
        return new Promise((resolve) => {
            // Create a simple modal - you can enhance this with Bootstrap modals
            const modal = document.createElement('div');
            modal.className = 'edit-post-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Edit Post</h3>
                    <div class="form-group">
                        <label>Title:</label>
                        <input type="text" id="edit-title" value="${postData.title}" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Content:</label>
                        <textarea id="edit-content" class="form-control">${postData.content}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Tags (comma-separated):</label>
                        <input type="text" id="edit-tags" value="${postData.tags.join(', ')}" class="form-control">
                    </div>
                    <div class="modal-actions">
                        <button id="save-edit" class="btn btn-primary">Save</button>
                        <button id="cancel-edit" class="btn btn-secondary">Cancel</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle modal actions
            modal.querySelector('#save-edit').onclick = () => {
                const editedData = {
                    title: modal.querySelector('#edit-title').value,
                    content: modal.querySelector('#edit-content').value,
                    tags: modal.querySelector('#edit-tags').value.split(',').map(tag => tag.trim())
                };
                document.body.removeChild(modal);
                resolve(editedData);
            };

            modal.querySelector('#cancel-edit').onclick = () => {
                document.body.removeChild(modal);
                resolve(null);
            };
        });
    }

    /**
     * Show comment input modal
     */
    async showCommentModal() {
        return new Promise((resolve) => {
            const commentText = prompt('Enter your comment:');
            resolve(commentText);
        });
    }

    /**
     * Show confirmation dialog
     */
    async showConfirmDialog(title, message) {
        return confirm(`${title}\n\n${message}`);
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        // You can implement toast notifications or use your existing notification system
        console.log('Success:', message);
        alert(message); // Simple implementation
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        console.error('Error:', message);
        alert(message); // Simple implementation
    }
}

// Initialize post actions handler
export const postActionsHandler = new PostActionsHandler();
