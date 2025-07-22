/**
 * Paginate an array of items.
 * @param {Array} items - Full list of items.
 * @param {number} page - Current page number (1-based).
 * @param {number} pageSize - Number of items per page.
 * @returns {Array} Paginated items.
 */
export function paginateItems(items, page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
