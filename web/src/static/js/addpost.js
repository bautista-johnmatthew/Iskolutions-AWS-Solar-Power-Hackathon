import {validateForumPost, validateField, preloadSchemas} from './schema.js';

$(document).ready(function() {    
    console.log("App loaded successfully");
    preloadSchemas();
    const selectedTags = [];

    // Handle new post form submission
    $("#postForm").on("submit", function(event) {
        console.log("New post form submitted");
        event.preventDefault();
        
        const formData = {
            title: $("#postTitle").val(),
            content: $("#postContent").val(),
            tags: selectedTags,
            anonymous: $("#postAnonymous").is(":checked"),
            attachment: $("#postAttachment")[0].files[0] // Assuming file input for attachment
        };
        
        const validationResult = validateForumPost(formData);
        
        if (validationResult.isValid) {
            console.log("Form is valid:", validationResult.data);
            // Here you can proceed with form submission, e.g., send data to the server
        } else {
            console.error("Validation errors:", validationResult.error);
        };
    });

    $("#postTitle").on("blur", function() {
        const validationResult = validateField('title', $(this).val());
        
        if (!validationResult.isValid) {
            console.error(`Validation errors for title:`, validationResult.error);
        }
    });

    $("#postContent").on("blur", function() {
        const validationResult = validateField('content', $(this).val());
        
        if (!validationResult.isValid) {
            console.error(`Validation errors for content:`, validationResult.error);
        }
    });
    
    // Iterate over checkboxes with a specific class
    $(".tag-checkbox").each(function() {
        $(this).on("change", function() {
            if ($(this).is(":checked")) {   
                selectedTags.push($(this).val());
                console.log(selectedTags.length)
            } else {
                const tagValue = $(this).val();
                selectedTags.splice(selectedTags.indexOf(tagValue), 1);
            }

            const validationResult = validateField('tags', selectedTags);
        
            if (!validationResult.isValid) {
                console.error(`Validation errors for tags:`, validationResult.error);
            }
        });
    });

    $("#postAnonymous").on("change", function() {
        const validationResult = validateField('anonymous', $(this).is(":checked"));
        
        if (!validationResult.isValid) {
            console.error(`Validation errors for anonymous:`, validationResult.error);
        }
    });

    $("#postAttachment").on("change", function() {
        const validationResult = validateField('attachment', $(this)[0].files[0]);
        
        if (!validationResult.isValid) {
            console.error(`Validation errors for attachment:`, validationResult.error);
        }
    });
});