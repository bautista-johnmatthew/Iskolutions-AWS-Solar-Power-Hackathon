import { validateField, preloadSchemas } from "./schema.js";
import { addErrorMessage, clearErrorMessage } from '../errorhandling.js';

function addComment(event) {
    clearErrorMessage('#commentContent');
    event.preventDefault();
    
    const validationResult = validateField('comment', $("#commentContent").val());

    if (validationResult.isValid) {
        console.log("Form is valid:", validationResult.value);
        // Here you can proceed with form submission, e.g., send data to the server
    } else {
        console.error("Validation errors:", validationResult.error);
        addErrorMessage("#commentContent", validationResult.error);
    }
}

$(document).ready(function() {
    preloadSchemas();

    $("#commentForm").on("submit", function(event) {
        addComment(event);
    });

    $("#commentContent").on("blur", function(event) {
        addComment(event);
    });
});