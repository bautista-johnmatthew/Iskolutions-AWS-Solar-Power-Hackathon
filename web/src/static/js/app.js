import { sessionManager } from "./managers/session-manager.js";
import { feedManager } from './managers/feed-manager.js';
import { filterPostsByTag } from "./utils/filter.js";

$(document).ready(function () {
    console.log("User session:", sessionManager.getUser());
    console.log("App loaded successfully");

    if (feedManager) {
        feedManager.initialize();
    }

    $('.filter-btn').on('click', function () {
        const tag = $(this).text();
        filteredPosts = filterPostsByTag(feedManager.posts, tag);
        console.log("Filtering posts by tag:", tag);
        feedManager.loadPosts(filteredPosts);
    });

    $('#logoutBtn').on('click', function () {
        sessionManager.clearSession();
        window.location.href = '/';
    });
});

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.querySelector('.toggle-password-btn i');
  const isPassword = passwordInput.type === 'password';

  passwordInput.type = isPassword ? 'text' : 'password';
  toggleBtn.className = isPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
}