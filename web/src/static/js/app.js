import { sessionManager } from "./managers/session-manager.js";
import { feedManager } from './managers/feed-manager.js';

$(document).ready(function () {
    console.log("User session:", sessionManager.getUser());
    console.log("App loaded successfully");

    // Initalize default template
    postDataArray.forEach(post => loadPostTemplate(post));

    if (feedManager) {
        feedManager.initialize();
    }

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

// Static summary content to be appended
const mockSummaryHTML = `
  <hr>
  <div class="summary-content">
    <i class="bi bi-robot"></i>
    <strong>Summary:</strong> This is a summarized version of the post.
  </div>
`;

// Load each post from template
function loadPostTemplate(postData) {
  $.get("post-template.html", function (template) {
    const filledPost = template
      .replace("{{tags}}", postData.tags.join(", "))
      .replace("{{username}}", postData.username)
      .replace("{{title}}", postData.title)
      .replace("{{content}}", postData.content)
      .replace("{{timeAgo}}", postData.timeAgo)
      .replace("{{summary}}", postData.summary || "")
      .replace("{{attachments}}", generateAttachmentHTML(postData.attachments || []));

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

// Load comment from template
function loadCommentTemplate(commentData, targetContainer) {
  $.get("comment-template.html", function (template) {
    const filled = template
      .replace("{{commenter}}", commentData.username)
      .replace("{{commentText}}", commentData.text)
      .replace("{{timeAgo}}", commentData.timeAgo);

    targetContainer.append(filled);
  });
}

// Sample post data
const postDataArray = [
  {
    username: "perlita",
    tags: ["#math", "#reviewer"],
    title: "Introduction to Accounting Reviewer",
    content: "Hello po. I am a freshman...",
    timeAgo: "1d ago",
    summary: "This is a summarized version of the post.",
    attachments: [
      { name: "Accounting Reviewer.pdf", url: "../img/tester.pdf" }
    ],
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

function generateAttachmentHTML(attachments) {
  if (!attachments.length) return '';

  let html = `<div class="attachment-list"><strong>📎 Attachments:</strong><ul>`;
  attachments.forEach(file => {
    html += `
      <li class="attachment-item">
        <span class="filename">${file.name}</span>
        <a class="download-btn" href="${file.url}" download>
          <i class="bi bi-download"></i>
        </a>
      </li>`;
  });
  html += `</ul></div>`;

  return html;
}
