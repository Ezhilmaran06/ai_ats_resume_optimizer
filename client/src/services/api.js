import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

/**
 * Primary API method to analyze resume against job description.
 * @param {File} resumeFile - PDF, DOCX, or TXT file
 * @param {string} jobDescription - Job description text
 * @param {Function} onUploadProgress - Optional upload progress callback
 */
export async function analyzeResume(resumeFile, jobDescription, onUploadProgress) {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('job_description', jobDescription);

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
}

export default api;
