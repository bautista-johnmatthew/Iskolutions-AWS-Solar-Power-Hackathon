import { commentSchema } from "./schema";

function addComment(event) {
    event.preventDefault();
    const formData = {
        content: $("#commentContent").val(),
    };

    const validationResult = validateField('comment', formData);

    if (validationResult.isValid) {
        console.log("Form is valid:", validationResult.value);
        // Here you can proceed with form submission, e.g., send data to the server
    } else {
        console.error("Validation errors:", validationResult.error);
    }
}

$(document).ready(function() {
    commentSchema.safeParse({});

    $("#commentForm").on("submit", function(event) {
        addComment(event);
    });

    $("#commentContent").on("blur", function() {
        addComment(event);
    });
});