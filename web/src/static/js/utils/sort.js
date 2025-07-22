/**
 * Sort posts by a given field.
 * @param {Array} posts - List of posts.
 * @param {string} field - Field to sort by (e.g., 'createdAt', 'title').
 * @param {boolean} ascending - Sort direction.
 * @returns {Array} Sorted posts.
 */
export function sortPosts(posts, field='createdAt', ascending=false) {
  return [...posts].sort((a, b) => {
    if (a[field] < b[field]) return ascending ? -1 : 1;
    if (a[field] > b[field]) return ascending ? 1 : -1;
    return 0;
  });
}
