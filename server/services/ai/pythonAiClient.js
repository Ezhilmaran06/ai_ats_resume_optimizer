const axios = require('axios');

const PYTHON_AI_URL = process.env.AI_SERVICE_URL || process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

const pythonClient = axios.create({
  baseURL: PYTHON_AI_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json'
  }
});

// Intercept axios errors to produce structured AI_SERVICE_UNAVAILABLE errors
function handleAxiosError(err, contextMsg) {
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
    const error = new Error('The AI analysis service is currently unavailable.');
    error.code = 'AI_SERVICE_UNAVAILABLE';
    error.statusCode = 503;
    throw error;
  }
  if (err.response?.data?.error) {
    const error = new Error(err.response.data.error.message || err.message);
    error.code = err.response.data.error.code || 'AI_SERVICE_ERROR';
    error.statusCode = err.response.status || 500;
    throw error;
  }
  if (err.response?.data?.detail) {
    const error = new Error(err.response.data.detail);
    error.code = 'AI_SERVICE_ERROR';
    error.statusCode = err.response.status || 500;
    throw error;
  }
  throw err;
}

/**
 * Check if Python AI microservice is responsive
 */
async function checkPythonHealth() {
  try {
    const res = await pythonClient.get('/api/ai/health', { timeout: 3000 });
    return res.data?.status === 'online' || res.data?.status === 'ok';
  } catch (err) {
    return false;
  }
}

/**
 * Stream/send multipart resume document to Python parser
 */
async function parseResumeWithPython(fileBuffer, originalname, mimetype) {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: originalname,
      contentType: mimetype
    });

    const response = await pythonClient.post('/api/ai/resume/parse', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    return response.data;
  } catch (err) {
    handleAxiosError(err, 'parseResume');
  }
}

/**
 * Run deterministic + analytical ATS scoring engine
 */
async function analyzeAtsWithPython(resume, role = null) {
  try {
    const response = await pythonClient.post('/api/ai/ats/analyze', {
      resume,
      role
    });
    return response.data.data || response.data;
  } catch (err) {
    handleAxiosError(err, 'analyzeAts');
  }
}

/**
 * Analyze job description and extract requirements
 */
async function analyzeRoleWithPython(role, description, company = '') {
  try {
    const response = await pythonClient.post('/api/ai/role/analyze', {
      role,
      description,
      company
    });
    return response.data.data || response.data.role || response.data;
  } catch (err) {
    handleAxiosError(err, 'analyzeRole');
  }
}

/**
 * Analyze keywords & semantic match between resume and role
 */
async function analyzeKeywordsWithPython(resume, role) {
  try {
    const response = await pythonClient.post('/api/ai/role/keywords', {
      resume,
      role
    });
    return response.data.data || response.data;
  } catch (err) {
    handleAxiosError(err, 'analyzeKeywords');
  }
}

/**
 * Run AI resume optimizer with anti-fabrication rules via Python engine
 */
async function optimizeResumeWithPython(resume, role) {
  try {
    const response = await pythonClient.post('/api/ai/resume/optimize', {
      resume,
      role
    });
    return response.data.data || response.data;
  } catch (err) {
    handleAxiosError(err, 'optimizeResume');
  }
}

/**
 * Generate optimization plan with anti-fabrication constraints
 */
async function getOptimizationPlanWithPython(resume, role) {
  return optimizeResumeWithPython(resume, role);
}

/**
 * Semantic resume role matching via Python engine
 */
async function analyzeMatchWithPython(resume, role) {
  try {
    const response = await pythonClient.post('/api/ai/match/analyze', {
      resume,
      role
    });
    return response.data.data || response.data.match || response.data;
  } catch (err) {
    handleAxiosError(err, 'analyzeMatch');
  }
}

/**
 * Live ATS score recalculation
 */
async function recalculateAtsWithPython(resume, role = null) {
  try {
    const response = await pythonClient.post('/api/ai/resume/recalculate', {
      resume,
      role
    });
    return response.data.data || response.data;
  } catch (err) {
    handleAxiosError(err, 'recalculateAts');
  }
}

module.exports = {
  checkPythonHealth,
  parseResumeWithPython,
  analyzeAtsWithPython,
  analyzeRoleWithPython,
  analyzeKeywordsWithPython,
  analyzeMatchWithPython,
  optimizeResumeWithPython,
  getOptimizationPlanWithPython,
  recalculateAtsWithPython
};
