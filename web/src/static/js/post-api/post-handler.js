import { updatePost, deletePost, patchPost } from './postUtils.js';
import { feedManager } from '../managers/feed-manager.js';
import { voteHandler } from '../vote-api/vote-handler.js';
import { wireEditModalEvents } from '../validation/editpost.js';

const selectedTags = [];

/**
 * Handles all post-related actions (edit, delete, vote, etc.)
 */
export class PostActionsHandler {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * Setup event listeners using event delegation for dynamically added posts
     */
    setupEventListeners(postId, postWrapper) {
        $(postWrapper).on('click', (e) => {
            if (!postWrapper) return;

            if (e.target.classList.contains('edit-post-btn')) {
                this.handleEditPost(postId, postWrapper);
            } else if (e.target.classList.contains('delete-post-btn')) {
                this.handleDeletePost(postId);
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

    async handleVote(postId, voteType, button) {
        try {
            voteHandler.handlePostVote(postId, button, voteType);
        } catch (error) {
            console.error('Failed to handle post vote:', error);
            this.showErrorMessage('Failed to update vote. Please try again.');
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
     * Show edit modal
     */
    async showEditModal(postData) {
        return new Promise((resolve) => {
            // Create proper Bootstrap modal wrapper so it centers & overlays content
            const modal = document.createElement('div');
            modal.className = 'modal fade edit-post-modal';
            modal.tabIndex = -1;
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered modal-xl">
                    <div class="modal-content create-post-modal">
                        <div class="modal-header border-0">
                            <h2 class="modal-title w-100 text-center fw-bold">EDIT POST</h2>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <hr class="modal-divider" />
                        <form id="editPostForm">
                            <div class="modal-body">
                                <div class="row g-4">
                                    <!-- Left column -->
                                    <div class="col-md-7">
                                        <div class="mb-3">
                                            <label class="form-label">TITLE (REQUIRED)</label>
                                            <div class="input-with-icon">
                                                <i class="bi bi-file-post"></i>
                                                <input id="edit-title" type="text" class="form-control pill-input" placeholder="INPUT POST TITLE" value="${postData.title}">
                                            </div>
                                            <div class="invalid-feedback" id="editTitleError"></div>
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">DESCRIPTION</label>
                                            <textarea id="edit-content" class="form-control pill-textarea" rows="4" placeholder="INPUT DESCRIPTION">${postData.content}</textarea>
                                            <div class="invalid-feedback" id="editContentError"></div>
                                        </div>

                                        <div class="mb-2 small-text">
                                            DO YOU WANT TO ATTACH FILES? MAKE SURE IT'S IN PDF FORMAT AND LESS THAN 500KB.
                                        </div>
                                        <div class="input-with-icon file-pill">
                                            <i class="bi bi-paperclip"></i>
                                            <input id="editAttachment" type="file" class="form-control pill-input file-input" accept=".pdf" />
                                            <div class="invalid-feedback" id="editAttachmentError"></div>
                                        </div>
                                    </div>

                                    <!-- Right column -->
                                    <div class="col-md-5">
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="bi bi-tags"></i> CHOOSE TAGS
                                            </label>
                                            <div class="tag-buttons">
                                                <button type="button" id="freshman" class="tag-btn">FRESHMAN</button>
                                                <button type="button" id="requirements" class="tag-btn">REQUIREMENTS</button>
                                                <button type="button" id="programming" class="tag-btn">PROGRAMMING</button>
                                                <button type="button" id="review" class="tag-btn">REVIEW</button>
                                                <button type="button" id="resource" class="tag-btn">RESOURCE</button>
                                                <button type="button" id="lost-and-found" class="tag-btn">LOST & FOUND</button>
                                            </div>
                                            <div class="invalid-feedback" id="postTags"></div>
                                            <div> 
                                            <input class="d-none" id="edit-tags" value="${postData.tags.join(', ')}">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div class="modal-footer border-0">
                                <div class="invalid-feedback" id="editOverallError"></div>
                                <button id="save-edit" type="button" class="footer-btn post-btn">SAVE</button>
                                <button id="cancel-edit" type="button" class="footer-btn cancel-btn" data-bs-dismiss="modal">CANCEL</button>
                            </div>
                        </form>
                    </div>
                </div>`;

            document.body.appendChild(modal);
            const modalElement = new bootstrap.Modal(modal, { backdrop: 'static' });
            modalElement.show();

            // Wire validation & tag events
            wireEditModalEvents(postData.id);

            modal.querySelector('#save-edit').onclick = () => {
                const editedData = {
                    title: modal.querySelector('#edit-title').value,
                    content: modal.querySelector('#edit-content').value,
                    tags: modal.querySelector('#edit-tags').value.split(',').map(tag => tag.trim())
                };

                modalElement.hide();
                // Wait for transition end before removing
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                    resolve(editedData);
                }, { once: true });
            };
            modal.querySelector('#cancel-edit').onclick = () => {
                modalElement.hide();
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                    resolve(null);
                }, { once: true });
            };
        });
    }

    /**
     * Show confirmation dialog
     */
    async showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal fade confirm-delete-modal';
            modal.tabIndex = -1;
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content create-post-modal">
                        <div class="modal-header border-0">
                            <h5 class="modal-title w-100 text-center fw-bold">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <hr class="modal-divider" />
                        <div class="modal-body">
                            <p class="text-center mb-0 small-text">${message}</p>
                        </div>
                        <div class="modal-footer border-0 d-flex justify-content-center gap-3">
                            <button type="button" class="footer-btn cancel-btn" data-bs-dismiss="modal" id="confirm-cancel-btn">CANCEL</button>
                            <button type="button" class="footer-btn post-btn" id="confirm-delete-btn">DELETE</button>
                        </div>
                    </div>
                </div>`;

            document.body.appendChild(modal);
            const modalElement = new bootstrap.Modal(modal, { backdrop: 'static' });
            modalElement.show();

            const cleanup = (result) => {
                modalElement.hide();
                modal.addEventListener('hidden.bs.modal', () => {
                    modal.remove();
                    resolve(result);
                }, { once: true });
            };

            modal.querySelector('#confirm-delete-btn').addEventListener('click', () => cleanup(true));
            modal.querySelector('#confirm-cancel-btn').addEventListener('click', () => cleanup(false));
            // Also resolve false if user closes via X or backdrop
            modal.addEventListener('hidden.bs.modal', () => {
                if (document.body.contains(modal)) {
                    modal.remove();
                    resolve(false);
                }
            }, { once: true });
        });
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
     * Show error message
     */
    showErrorMessage(message) {
        console.error('Error:', message);
        alert(message);
    }
}

// Initialize post actions handler
export const postActionsHandler = new PostActionsHandler();
