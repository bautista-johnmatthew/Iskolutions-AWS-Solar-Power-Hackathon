import { sessionManager } from "./managers/session-manager.js";
import { feedManager } from './managers/feed-manager.js';
import { filterPostsByTag } from "./utils/filter.js";

$(document).ready(function () {
    // Comment out this section to prevent feed initialization
    if (feedManager) {
        feedManager.initialize();
    }

    // Event listener for filtering buttons
    $('.filter-btn').on('click', function () {
        const tag = $(this).text();
        const filteredPosts = filterPostsByTag(feedManager.posts, tag);
        console.log("Filtering posts by tag:", tag);
        feedManager.reloadPosts(filteredPosts, true);
    });

    // Event listener for logout button
    $('#logoutBtn').on('click', function () {
        sessionManager.clearSession();
        window.location.href = '/';
    });
});
