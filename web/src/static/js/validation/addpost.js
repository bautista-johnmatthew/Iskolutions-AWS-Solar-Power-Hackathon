import {validateForumPost, validateField, preloadSchemas} from './schema.js';
import { addErrorMessage, clearErrorMessage } from '../errorhandling.js';
import { createPost } from '../post-api/postUtils.js';
import { sessionManager } from '../auth/session-manager-vanilla.js';

const selectedTags = [];

// Form validation and submission handlers
function handlePostFormSubmit(event) {
    console.log("New post form submitted");
    event.preventDefault();
    
    // Get author ID from session
    const authorId = sessionManager.getUserId();
    
    if (!authorId) {
        alert('You must be logged in to create a post');
        return;
    }
    
    const formData = {
        title: $("#postTitle").val(),
        content: $("#postContent").val(),
        tags: selectedTags,
        anonymous: $("#postAnonymous").is(":checked"),
        attachment: $("#postAttachment")[0].files[0]
    };
    
    const validationResult = validateForumPost(formData);
    
    if (validationResult.isValid) {
        console.log("Form is valid:", validationResult.data);

        // Add author_id from session
        validationResult.data.author_id = authorId; 

        createPost(validationResult.data)
            .then(response => {
                console.log("Post created successfully:", response);
            });
    } else {
        console.error("Validation errors:", validationResult.error);
        // Handle error messages for each field
    }
}

// Functions that handle blur events for each field
// Function to handle title blur event
function handleTitleBlur() {
    const validationResult = validateField('title', $(this).val());
    
    if (!validationResult.isValid) {
        console.error(`Validation errors for title:`, validationResult.error);
        addErrorMessage("#postTitle", validationResult.error);
    } else {
        clearErrorMessage("#postTitle");
    }
}

// Function to handle content blur event
function handleContentBlur() {
    const validationResult = validateField('content', $(this).val());
    
    if (!validationResult.isValid) {
        console.error(`Validation errors for content:`, validationResult.error);
        addErrorMessage("#postContent", validationResult.error);
    } else {
        clearErrorMessage("#postContent");
    }
}

// Function to handle tag change event
function handleTagChange() {
    if ($(this).is(":checked")) {   
        selectedTags.push($(this).val());
        console.log(selectedTags.length);
    } else {
        const tagValue = $(this).val();
        selectedTags.splice(selectedTags.indexOf(tagValue), 1);
    }

    const validationResult = validateField('tags', selectedTags);

    if (!validationResult.isValid) {
        console.error(`Validation errors for tags:`, validationResult.error);
        addErrorMessage("#tagsContainer", validationResult.error);
    } else {
        clearErrorMessage("#tagsContainer");
    }
}

// Function to handle anonymous checkbox change
function handleAnonymousChange() {
    const validationResult = validateField('anonymous', $(this).is(":checked"));
    
    if (!validationResult.isValid) {
        console.error(`Validation errors for anonymous:`, validationResult.error);
        addErrorMessage("#postAnonymous", validationResult.error);
    } else {
        clearErrorMessage("#postAnonymous");
    }
}

// Function to handle attachment change
function handleAttachmentChange() {
    const validationResult = validateField('attachment', $(this)[0].files[0]);
    
    if (!validationResult.isValid) {
        console.error(`Validation errors for attachment:`, validationResult.error);
        addErrorMessage("#postAttachment", validationResult.error);
    } else {
        clearErrorMessage("#postAttachment");
    }
}

// Attach event listeners
$(document).ready(function() {    
    preloadSchemas();
    
    // Initialize session
    sessionManager.initialize();
    
    // Check if user is logged in
    const isLoggedIn = sessionManager.isLoggedIn();
    if (!isLoggedIn) {
        console.warn('User not logged in');
        // You might want to redirect to login or disable the form
    }

    $("#postForm").on("submit", handlePostFormSubmit);
    $("#postTitle").on("blur", handleTitleBlur);
    $("#postContent").on("blur", handleContentBlur);
    $("#postAnonymous").on("change", handleAnonymousChange);
    $("#postAttachment").on("change", handleAttachmentChange);
    
    // Handle tag checkboxes
    $(".tag-checkbox").each(function() {
        $(this).on("change", handleTagChange);
    });
});