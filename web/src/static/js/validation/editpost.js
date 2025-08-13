import { validateField, validateForumPost, preloadSchemas } from './schema.js';
import { addErrorMessage, clearErrorMessage } from '../utils/error-handling.js';
import { patchPost } from '../post-api/postUtils.js';
import { sessionManager } from '../managers/session-manager.js';
import { feedManager } from '../managers/feed-manager.js';
import { handleTagChange } from './addpost.js';

// Selected tags for edit context
const editSelectedTags = [];
preloadSchemas();

// Validate and submit edit form
export function handleEditFormSubmit(event, postId) {
    if (event) event.preventDefault();
    clearErrorMessage('#editOverallError');

    const authorId = sessionManager.getUserId();
    if (!authorId) {
        alert('You must be logged in to edit a post');
        return;
    }

    const formData = {
        title: $('#edit-title').val(),
        content: $('#edit-content').val(),
        tags: editSelectedTags.length ? editSelectedTags : ($('#edit-tags').val() ? $('#edit-tags').val().split(',').map(t => t.trim()) : []),
        attachment: $('#editAttachment')[0]?.files?.[0]
    };

    const validationResult = validateForumPost(formData);

    if (validationResult.isValid) {
        patchPost(postId, validationResult.data)
            .then(() => {
                feedManager.refresh();
                const modalEl = document.querySelector('.edit-post-modal.show');
                if (modalEl) {
                    const bsModal = bootstrap.Modal.getInstance(modalEl);
                    bsModal?.hide();
                }
            })
            .catch(err => {
                console.error('Edit failed', err);
                addErrorMessage('#editOverallError', [{ message: 'Failed to update post.' }]);
            });
    } else {
        let errorMsgList = '';
        validationResult.error.forEach(e => errorMsgList += `<p>${e.message}</p>`);
        addErrorMessage('#editOverallError', errorMsgList);
    }
}

export function handleEditTitleBlur() {
    const res = validateField('title', $(this).val());
    if (!res.isValid) addErrorMessage('#editTitleError', res.error); else clearErrorMessage('#editTitleError');
}

export function handleEditContentBlur() {
    const res = validateField('content', $(this).val());
    if (!res.isValid) addErrorMessage('#editContentError', res.error); else clearErrorMessage('#editContentError');
}

export function handleEditAttachmentChange() {
    const res = validateField('attachment', $(this)[0].files[0]);
    if (!res.isValid) addErrorMessage('#editAttachmentError', res.error); else clearErrorMessage('#editAttachmentError');
}

export function handleEditTagClick() {
    handleTagChange.call(this);
    const id = $(this).attr('id');
    if ($(this).hasClass('active')) {
        if (!editSelectedTags.includes(id)) editSelectedTags.push(id);
    } else {
        const idx = editSelectedTags.indexOf(id);
        if (idx !== -1) editSelectedTags.splice(idx, 1);
    }
    $('#edit-tags').val(editSelectedTags.join(', '));
}

export function wireEditModalEvents(postId) {
    const $modal = $('.edit-post-modal');
    if (!$modal.length) return;
    $modal.find('#edit-title').on('blur', handleEditTitleBlur);
    $modal.find('#edit-content').on('blur', handleEditContentBlur);
    $modal.find('#editAttachment').on('change', handleEditAttachmentChange);
    $modal.find('.tag-btn').each(function() {
      $(this).on('click', function() {
        $(this).toggleClass('active');
      });
    });
    $modal.find('.tag-btn').each(function () { $(this).on('click', handleEditTagClick); });
    $modal.find('#save-edit').on('click', (e) => handleEditFormSubmit(e, postId));
}

export function resetEditState() {
    editSelectedTags.length = 0;
}

export { editSelectedTags };
