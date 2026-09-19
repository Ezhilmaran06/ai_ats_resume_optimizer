/**
 * Environment Configuration Validator
 * Validates presence and formatting of required and optional environment variables
 * without leaking sensitive values.
 */

const validateEnv = () => {
  const warnings = [];
  const errors = [];

  // Validate PORT
  if (process.env.PORT) {
    const portNum = parseInt(process.env.PORT, 10);
    if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
      errors.push(`Invalid PORT "${process.env.PORT}". Must be an integer between 1 and 65535.`);
    }
  }

  // Validate MONGODB_URI
  if (!process.env.MONGODB_URI) {
    warnings.push('MONGODB_URI is not set. Falling back to default localhost or in-memory MongoDB.');
  }

  // Validate JWT_SECRET
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('JWT_SECRET is required in production mode!');
    } else {
      warnings.push('JWT_SECRET is not set. Using development fallback secret.');
    }
  } else if (process.env.JWT_SECRET.length < 16) {
    warnings.push('JWT_SECRET is short (<16 characters). A longer secret is recommended for security.');
  }

  // Validate CLIENT_URL
  if (!process.env.CLIENT_URL) {
    warnings.push('CLIENT_URL not specified. Defaulting to http://localhost:5173.');
  }

  // Validate AI Service configurations
  if (!process.env.AI_SERVICE_URL) {
    warnings.push('AI_SERVICE_URL is not set. Defaulting to http://localhost:8000.');
  }

  // Output validation summary
  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    warnings.forEach(w => console.warn(`[Config Warning] ${w}`));
  }

  if (errors.length > 0) {
    errors.forEach(e => console.error(`[Config Error] ${e}`));
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${errors.join('; ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
};

module.exports = validateEnv;
