// ✅ Log confirmation
$(document).ready(function () {
  console.log("App loaded successfully");
  postDataArray.forEach(post => loadPostTemplate(post));
});

// ✅ Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.querySelector('.toggle-password-btn i');
  const isPassword = passwordInput.type === 'password';

  passwordInput.type = isPassword ? 'text' : 'password';
  toggleBtn.className = isPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
}

// ✅ Static summary content to be appended
const mockSummaryHTML = `
  <hr>
  <div class="summary-content">
    <i class="bi bi-robot"></i>
    <strong>Summary:</strong> This is a summarized version of the post.
  </div>
`;

// ✅ Load each post from template
function loadPostTemplate(postData) {
  $.get("post-template.html", function (template) {
    const filledPost = template
      .replace("{{tags}}", postData.tags.join(", "))
      .replace("{{username}}", postData.username)
      .replace("{{title}}", postData.title)
      .replace("{{content}}", postData.content)
      .replace("{{timeAgo}}", postData.timeAgo)
      .replace("{{summary}}", postData.summary || "");

    const postElement = $(filledPost);
    $(".feed-container").append(postElement);

    // 💡 AI Summary button
    const summarizeBtn = postElement.find(".ai-summary-btn");
    summarizeBtn.on("click", function () {
      const postFooter = postElement.find(".post-footer");

      // Prevent duplicate summary
      if (postFooter.find(".summary-content").length === 0) {
        postFooter.append(mockSummaryHTML);
      }
    });

    // 💬 Load each comment
    const commentContainer = postElement.find(".comments-container");
    postData.comments.forEach(comment => {
      loadCommentTemplate(comment, commentContainer);
    });
  });
}

// ✅ Load comment from template
function loadCommentTemplate(commentData, targetContainer) {
  $.get("comment-template.html", function (template) {
    const filled = template
      .replace("{{commenter}}", commentData.username)
      .replace("{{commentText}}", commentData.text)
      .replace("{{timeAgo}}", commentData.timeAgo);

    targetContainer.append(filled);
  });
}

// ✅ Sample post data
const postDataArray = [
  {
    username: "perlita",
    tags: ["#math", "#reviewer"],
    title: "Introduction to Accounting Reviewer",
    content: "Hello po. I am a freshman...",
    timeAgo: "1d ago",
    summary: "This is a summarized version of the post.",
    comments: [
      {
        username: "seniorJuan",
        text: "Check this YouTube playlist!",
        timeAgo: "2h ago"
      },
      {
        username: "ateMia",
        text: "I can share my reviewer. PM me!",
        timeAgo: "1h ago"
      }
    ]
  }
];
