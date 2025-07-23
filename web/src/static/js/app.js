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

function loadPostTemplate(data) {
  $.get("post-template.html", function(template) {
    const tagHTML = data.tags.map(tag => `<span class="tag">${tag}</span>`).join("");
    template = template
      .replace("{{username}}", data.username)
      .replace("{{postTitle}}", data.title)
      .replace("{{postContent}}", data.content)
      .replace("{{timeAgo}}", data.timeAgo)
      .replace("{{tags}}", tagHTML);

    $(".feed-container").append(template);
  });
}

$(document).ready(function() {
  postData.forEach(post => loadPostTemplate(post));
});
