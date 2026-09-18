const axios = require('axios');

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';

const pythonClient = axios.create({
  baseURL: PYTHON_AI_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json'
  }
});

/**
 * Check if Python AI microservice is responsive
 */
async function checkPythonHealth() {
  try {
    const res = await pythonClient.get('/api/ai/health');
    return res.data?.status === 'online';
  } catch (err) {
    return false;
  }
}

/**
 * Stream/send multipart resume document to Python parser
 */
async function parseResumeWithPython(fileBuffer, originalname, mimetype) {
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
}

/**
 * Run deterministic + analytical ATS scoring engine
 */
async function analyzeAtsWithPython(resume, role = null) {
  const response = await pythonClient.post('/api/ai/ats/analyze', {
    resume,
    role
  });
  return response.data.data;
}

/**
 * Analyze job description and extract requirements
 */
async function analyzeRoleWithPython(role, description, company = '') {
  const response = await pythonClient.post('/api/ai/role/analyze', {
    role,
    description,
    company
  });
  return response.data.data;
}

/**
 * Analyze keywords & semantic match between resume and role
 */
async function analyzeKeywordsWithPython(resume, role) {
  const response = await pythonClient.post('/api/ai/role/keywords', {
    resume,
    role
  });
  return response.data.data;
}

/**
 * Generate optimization plan with anti-fabrication constraints
 */
async function getOptimizationPlanWithPython(resume, role) {
  const response = await pythonClient.post('/api/ai/optimizer/plan', {
    resume,
    role
  });
  return response.data;
}

/**
 * Live ATS score recalculation
 */
async function recalculateAtsWithPython(resume, role = null) {
  const response = await pythonClient.post('/api/ai/resume/recalculate', {
    resume,
    role
  });
  return response.data.data;
}

module.exports = {
  checkPythonHealth,
  parseResumeWithPython,
  analyzeAtsWithPython,
  analyzeRoleWithPython,
  analyzeKeywordsWithPython,
  getOptimizationPlanWithPython,
  recalculateAtsWithPython
};
