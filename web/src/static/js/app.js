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

