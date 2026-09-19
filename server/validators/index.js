const { validateRegisterInput, validateLoginInput } = require('./authValidator');
const { validateResumeInput } = require('./resumeValidator');

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateResumeInput
};
