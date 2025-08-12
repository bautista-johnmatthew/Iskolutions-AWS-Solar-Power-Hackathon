import { sessionManager } from "./managers/session-manager.js";
import { feedManager } from './managers/feed-manager.js';
import { filterPostsByTag } from "./utils/filter.js";
import { fuzzySearchPosts } from "./post-api/postUtils.js"

$(document).ready(function () {
    // Comment out this section to prevent feed initialization
    if (feedManager) {
        feedManager.initialize();
    }

    $('.search-btn').on('click', function () {
        const query = $('#search').val().toLowerCase();
        const filteredPosts = fuzzySearchPosts(feedManager.posts, query);
        feedManager.reloadPosts(filteredPosts, true);
    });

    // Event listener for filtering buttons
    $('.filter-btn').on('click', function () {
        let tags = [];
        $('.filter-btn.active').each(function () {
            tags.push($(this).text().toLowerCase());
        });

        const filteredPosts = filterPostsByTag(feedManager.posts, tags);
        console.log("Filtering posts by tags:", tags);
        feedManager.reloadPosts(filteredPosts, true);
    });

    // Event listener for logout button
    $('#logoutBtn').on('click', function () {
        sessionManager.clearSession();
        window.location.href = '/';
    });
});
