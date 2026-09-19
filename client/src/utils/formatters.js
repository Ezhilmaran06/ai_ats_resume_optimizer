/**
 * Format date string into human-readable format (e.g., "Jan 2024")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Format file size in bytes to human-readable string (KB/MB)
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format score to integer percentage
 */
export function formatScore(score) {
  if (typeof score !== 'number') return '0%';
  return `${Math.round(Math.max(0, Math.min(100, score)))}%`;
}
