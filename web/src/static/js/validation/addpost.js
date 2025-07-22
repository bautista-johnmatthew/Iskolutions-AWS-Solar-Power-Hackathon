import {validateForumPost, validateField, preloadSchemas} from './schema.js';
import { addErrorMessage, clearErrorMessage } from '../errorhandling.js';

const selectedTags = [];

// Form validation and submission handlers
function handlePostFormSubmit(event) {
    console.log("New post form submitted");
    event.preventDefault();
    
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
        // Here you can proceed with form submission, e.g., send data to the server
    } else {
        console.error("Validation errors:", validationResult.error);
        // Handle error messages for each field
    }
}

function handleTitleBlur() {
    const validationResult = validateField('title', $(this).val());
    
    if (!validationResult.isValid) {
        console.error(`Validation errors for title:`, validationResult.error);
        addErrorMessage("#postTitle", validationResult.error);
    } else {
        clearErrorMessage("#postTitle");
    }
}

function handleContentBlur() {
    const validationResult = validateField('content', $(this).val());
    
    if (!validationResult.isValid) {
        console.error(`Validation errors for content:`, validationResult.error);
        addErrorMessage("#postContent", validationResult.error);
    } else {
        clearErrorMessage("#postContent");
    }
}

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

function handleAnonymousChange() {
    const validationResult = validateField('anonymous', $(this).is(":checked"));
    
    if (!validationResult.isValid) {
        console.error(`Validation errors for anonymous:`, validationResult.error);
        addErrorMessage("#postAnonymous", validationResult.error);
    } else {
        clearErrorMessage("#postAnonymous");
    }
}

function handleAttachmentChange() {
    const validationResult = validateField('attachment', $(this)[0].files[0]);
    
    if (!validationResult.isValid) {
        console.error(`Validation errors for attachment:`, validationResult.error);
        addErrorMessage("#postAttachment", validationResult.error);
    } else {
        clearErrorMessage("#postAttachment");
    }
}

$(document).ready(function() {    
    console.log("App loaded successfully");
    preloadSchemas();

    // Attach event listeners
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