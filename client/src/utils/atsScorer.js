/**
 * Get visual tier classification for an ATS Score (0-100)
 */
export function getScoreTier(score = 0) {
  if (score >= 85) {
    return {
      tier: 'Excellent',
      color: '#10B981',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      badgeClass: 'badge-success',
      description: 'Optimized for modern ATS filters and recruiter screening.'
    };
  }
  if (score >= 70) {
    return {
      tier: 'Good',
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      badgeClass: 'badge-info',
      description: 'Solid ATS compatibility with minor targeted improvements needed.'
    };
  }
  if (score >= 50) {
    return {
      tier: 'Moderate',
      color: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FDE68A',
      badgeClass: 'badge-warning',
      description: 'Significant keyword and structural gaps detected.'
    };
  }
  return {
    tier: 'Needs Work',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    badgeClass: 'badge-danger',
    description: 'High risk of ATS parser rejection or low keyword ranking.'
  };
}
