/**
 * Resume Input Validation Helpers
 */
const validateResumeInput = (data) => {
  const errors = {};
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Resume title is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateResumeInput
};
