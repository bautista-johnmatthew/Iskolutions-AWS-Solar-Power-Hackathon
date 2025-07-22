/**
 * Filter posts by tag.
 * @param {Array} posts - List of posts.
 * @param {string} tag - Tag to filter by.
 * @returns {Array} Filtered posts.
 */
export function filterPostsByTag(posts, tag) {
  return posts.filter(post => post.tags?.includes(tag));
}