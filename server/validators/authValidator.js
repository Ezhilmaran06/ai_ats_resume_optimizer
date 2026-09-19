/**
 * Auth Validation Helpers
 */
const validateRegisterInput = (data) => {
  const errors = {};
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  }
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.email = 'Please provide a valid email address';
  }
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateLoginInput = (data) => {
  const errors = {};
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email is required';
  }
  if (!data.password) {
    errors.password = 'Password is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateRegisterInput,
  validateLoginInput
};
