// Function to add error message to the error label
// This assumes the error label is a sibling of the input field with class 'invalid-feedback'
function addErrorMessage(selector, message) {
    const errorLabel = $(`${selector}Error`);
    
    // If message is an array, join messages with line breaks
    const messageText = Array.isArray(message) 
        ? message.map(m => m.message || m).join('<br>') 
        : message;
    
    // If the error label exists, update it
    if (errorLabel.length) {
        errorLabel.html(messageText);
        errorLabel.css('display', 'inline-block');
    } else {
        // Create a new error label if it doesn't exist
        $(selector).after(`<div class="invalid-feedback" id="${selector}Error">${messageText}</div>`);
    }
}

// Reverses the effect of addErrorMessage
function clearErrorMessage(selector) {
    // Hide and clear the error message
    const errorLabel = $(`${selector}Error`);
    if (errorLabel.length) {
        errorLabel.hide();
        errorLabel.text('');
    }
}

// Export error handling functions
export { addErrorMessage, clearErrorMessage };