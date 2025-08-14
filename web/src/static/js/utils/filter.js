/**
 * Filter posts by one or more tags.
 * @param {Array} posts - List of posts to filter.
 * @param {Array|string} tags - Tag or array of tags to filter by.
 * @returns {Array} - List of posts that include at least one of the tags.
 */
export function filterPostsByTag(posts, tags) {
    if (!tags || tags.length === 0) return posts;
    
    // If tags is a string, convert it to an array
    const tagArray = Array.isArray(tags) ? tags : [tags];
    
    return posts.filter(post => {
        if (!post.tags) return false;
        return tagArray.some(tag => post.tags.includes(tag));
    });
}