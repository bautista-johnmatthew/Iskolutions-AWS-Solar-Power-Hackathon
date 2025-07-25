import { sessionManager } from '../auth/session-manager-vanilla.js';
import { togglePostVote, getUserPostVotes } from './voteUtils.js';

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

    checkUserLoggedIn() {
        if (sessionManager.isLoggedIn()) {
            return Promise.resolve(true);
        } else {
            this.showErrorMessage('You must be logged in to vote.');
            return Promise.reject(new Error('User not logged in'));
        }
    }

    async handleVoteClick(event) {
        event.preventDefault();
        if (!await this.checkUserLoggedIn()) return;

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
            const result = await togglePostVote(postId, voteType, isCurrentlyVoted);

            // Update UI and vote count if successful
            this.updateVoteButtonUI(button, !isCurrentlyVoted);
            this.updateVoteCount(button, !isCurrentlyVoted && voteType === 'up');

            // Track user's vote state
            const voteKey = `post_${postId}`;
            if (!isCurrentlyVoted) {
                this.userVotes.set(voteKey, voteType);
                // Remove opposite vote if exists
                this.removeOppositeVote(postElement, voteType);
            } else {
                this.userVotes.delete(voteKey);
            }

            console.log('Post vote updated:', result);

        } catch (error) {
            // Revert UI changes on error
            this.updateVoteButtonUI(button, isCurrentlyVoted);
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

    removeOppositeVote(container, voteType) {
        const oppositeType = voteType === 'up' ? 'down' : 'up';
        const oppositeButton = container.querySelector(`[data-vote-type="${oppositeType}"]`);

        if (oppositeButton && oppositeButton.classList.contains('voted')) {
            this.updateVoteButtonUI(oppositeButton, false);
            this.updateVoteCount(oppositeButton, false);
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

            console.log('Initializing vote states for posts:', posts);
            // Extract post IDs
            const postIds = posts.map(post => post.id);

            // Get user's current votes for these posts
            const userVotes = await getUserPostVotes(postIds);

            // Update UI for each post based on user's votes
            posts.forEach(post => {
                const postElement = document.querySelector(`[data-post-id="${post.id}"]`);
                if (!postElement) return;

                // Check if user has voted on this post
                const userVote = userVotes[post.id];
                if (userVote) {
                    // Find the corresponding vote button and mark it as voted
                    const voteButton = postElement.querySelector(`[data-vote-type="${userVote}"]`);
                    if (voteButton) {
                        this.updateVoteButtonUI(voteButton, true);
                        this.userVotes.set(`post_${post.id}`, userVote);
                    }
                }

                // Initialize vote counts from post data
                const upButton = postElement.querySelector('[data-vote-type="up"]');
                const downButton = postElement.querySelector('[data-vote-type="down"]');

                console.log('Initializing vote states for post:', post.id);
                console.log('Post data:', post);

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
