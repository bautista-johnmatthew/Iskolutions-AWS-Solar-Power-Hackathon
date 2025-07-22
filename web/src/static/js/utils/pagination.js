/**
 * Paginate an array of posts.
 * @param {Array} posts - Full list of posts.
 * @param {number} page - Current page number (1-based).
 * @param {number} pageSize - Number of posts per page.
 * @returns {Array} Paginated posts.
 */
export function paginateItems(items, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
