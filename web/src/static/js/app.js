$(document).ready(function() {
    console.log("App loaded successfully");
});

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.querySelector('.toggle-password-btn i');
  const isPassword = passwordInput.type === 'password';

  passwordInput.type = isPassword ? 'text' : 'password';
  toggleBtn.className = isPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
}

function loadPostTemplate(postData) {
  $.get("post-template.html", function(template) {
    const filledPost = template
      .replace("{{username}}", postData.username)
      .replace("{{title}}", postData.title)
      .replace("{{content}}", postData.content)
      .replace("{{timeAgo}}", postData.timeAgo);

    const postElement = $(filledPost);
    $(".feed-container").append(postElement);

    // Now load the comments
    const commentContainer = postElement.find(".comments-container");
    postData.comments.forEach(comment => {
      loadCommentTemplate(comment, commentContainer);
    });
  });
}

$(document).ready(function() {
  postData.forEach(post => loadPostTemplate(post));
});

function loadCommentTemplate(commentData, targetContainer) {
  $.get("comment-template.html", function(template) {
    const filled = template
      .replace("{{commenter}}", commentData.username)
      .replace("{{commentText}}", commentData.text)
      .replace("{{commentTime}}", commentData.timeAgo);

    targetContainer.append(filled);
  });
}
