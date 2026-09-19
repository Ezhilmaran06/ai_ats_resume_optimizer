/**
 * Combine multiple class names safely
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Truncate a string with ellipsis if longer than length
 */
export function truncate(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
