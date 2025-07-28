import { authService } from '../auth/auth-service.js';

function urlRemoveEmail() {
    // Remove email from URL query parameters
    const url = new URL(window.location.href);
    const email = url.searchParams.get('email');
    console.log('Removing email from URL:', email);

    url.searchParams.delete('email');
    window.history.replaceState({}, document.title, url.toString());

    // If email was provided, set it in the userEmail input field
    if (email && email.trim() !== '') {
        const userEmail = $('#userEmail');
        userEmail.text(email.trim());
    }
}

$(document).ready(function() {
    urlRemoveEmail();
    authService.processAuthCallback();

    $('#resendLinkBtn').on('click', async function() {
        const userEmail = $('#userEmail').text().trim();

        if (!userEmail) {
            alert('No email address found. Please try again later.');
            return;
        }

        try {
            await authService.resendConfirmation(userEmail);
            alert('Confirmation link has been resent to ' + userEmail);
        } catch (error) {
            console.error('Error resending confirmation:', error);
            alert('Failed to resend confirmation link. Please try again later.');
        }
    });
});