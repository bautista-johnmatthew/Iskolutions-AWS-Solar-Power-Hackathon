
import { sessionManager } from '../managers/session-manager.js';
import { togglePostVote, getUserPostVotes, formatUserVotes, removePostVote, votePost } from './voteUtils.js';


/**
 * Vote Handler - Manages vote button interactions and UI updates
 */
class VoteHandler {
    constructor() {
        this.userVotes = new Map(); // Track user's current votes
        this.initialize();
    }

    initialize() {
        // Use event delegation to handle vote buttons
        document.addEventListener('click', (event) => {
            if (event.target.closest('.vote-btn')) {
                this.handleVoteClick(event);
            }
        });
    }


    async handleVoteClick(event) {
        event.preventDefault();
        if (!sessionManager.isLoggedIn()) {
            this.showErrorMessage('You must be logged in to vote.');
            return;
        }

        const button = event.target.closest('.vote-btn');
        const voteType = button.dataset.voteType; // 'up' or 'down'

        // Determine if this is a post or comment vote
        const postElement = button.closest('.post-wrapper');

        if (postElement) {
            await this.handlePostVote(postElement, button, voteType);
        }
    }

    async handlePostVote(postElement, button, voteType) {
        const postId = postElement.dataset.postId;
        const isCurrentlyVoted = button.classList.contains('voted');

        try {
            const voteKey = `post_${postId}`;

            if (!isCurrentlyVoted) {
                // First remove any opposite vote (important: do this before adding new vote)
                await this.removeOppositeVote(postId, postElement, voteType);

                // Then add the new vote
                await votePost(postId, voteType, sessionManager.getUserId());
                this.userVotes.set(voteKey, voteType);

                // Update UI after successful backend operations
                this.updateVoteButtonUI(button, true);
                this.updateVoteCount(button, true);
            } else {
                // Remove current vote
                await removePostVote(postId, voteType, sessionManager.getUserId());
                this.userVotes.delete(voteKey);

                // Update UI after successful backend operation
                this.updateVoteButtonUI(button, false);
                this.updateVoteCount(button, false);
            }
        } catch (error) {
            // Revert UI changes on error - no changes were made to UI yet, so just log
            console.error('Failed to update post vote:', error);
            this.showErrorMessage('Failed to update vote. Please try again.');
        }
    }

    updateVoteButtonUI(button, isVoted) {
        if (isVoted) {
            button.classList.add('voted');
            button.classList.remove('btn-outline-primary', 'btn-outline-danger');
            if (button.dataset.voteType === 'up') {
                button.classList.add('btn-primary');
            } else {
                button.classList.add('btn-danger');
            }
        } else {
            button.classList.remove('voted', 'btn-primary', 'btn-danger');
            if (button.dataset.voteType === 'up') {
                button.classList.add('btn-outline-primary');
            } else {
                button.classList.add('btn-outline-danger');
            }
        }
    }

    updateVoteCount(button, isIncrement) {
        const countSpan = button.querySelector('.vote-count');
        if (countSpan) {
            let currentCount = parseInt(countSpan.textContent) || 0;
            currentCount += isIncrement ? 1 : -1;
            countSpan.textContent = Math.max(0, currentCount);
        }
    }

    async removeOppositeVote(postId, container, voteType) {
        const oppositeType = voteType === 'up' ? 'down' : 'up';
        const oppositeButton = container.querySelector(`[data-vote-type="${oppositeType}"]`);

        if (oppositeButton && oppositeButton.classList.contains('voted')) {
            // Remove from backend first
            await removePostVote(postId, oppositeType, sessionManager.getUserId());

            // Update UI after successful backend operation
            this.updateVoteButtonUI(oppositeButton, false);
            this.updateVoteCount(oppositeButton, false);

            // Update local tracking
            const voteKey = `post_${postId}`;
            this.userVotes.delete(voteKey);
        }
    }

    showErrorMessage(message) {
        // Simple error display - you can enhance this with a toast or modal
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.zIndex = '9999';
        errorDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    /**
     * Initialize vote states for posts/comments (call after loading posts)
     * @param {Array} posts - Array of post data with vote information
     */
    async initializeVoteStates(posts) {
        try {
            // Extract post IDs
            const postIds = posts.map(post => post.id);
            const isUserLoggedIn = sessionManager.isLoggedIn();

            // Get user's current votes for these posts
            let userVoteMap = {};
            if (isUserLoggedIn) {
                const userVotes = await getUserPostVotes(postIds);
                userVoteMap = formatUserVotes(userVotes['user_votes']);
            }

            // Update UI for each post based on user's votes
            posts.forEach(post => {
                const postElement = document.querySelector(`[data-post-id="${post.id}"]`);
                if (!postElement) return;

                if (isUserLoggedIn) {
                    // Check if user has voted on this post
                    const userVote = userVoteMap[post.id];

                    if (userVote) {
                        // Find the corresponding vote button and mark it as voted
                        const voteButton = postElement.querySelector(`[data-vote-type="${userVote}"]`);
                        if (voteButton) {
                            this.updateVoteButtonUI(voteButton, true);
                            this.userVotes.set(`post_${post.id}`, userVote);
                        }
                    }
                }

                // Initialize vote counts from post data
                const upButton = postElement.querySelector('[data-vote-type="up"]');
                const downButton = postElement.querySelector('[data-vote-type="down"]');

                if (upButton) {
                    const upCountSpan = upButton.querySelector('.vote-count');
                    if (upCountSpan) {
                        upCountSpan.textContent = post.upvotes || 0;
                    }
                }

                if (downButton) {
                    const downCountSpan = downButton.querySelector('.vote-count');
                    if (downCountSpan) {
                        downCountSpan.textContent = post.downvotes || 0;
                    }
                }
            });

        } catch (error) {
            console.error('Error initializing vote states:', error);
        }
    }
}

// Create global instance
export const voteHandler = new VoteHandler();
