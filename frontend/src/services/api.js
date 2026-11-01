/**
 * Centralized API service for SignSpeak AI frontend.
 * Communicates with the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  /**
   * Health check endpoint
   */
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      return { status: 'error', service: 'sign-language-recognition', model_loaded: false, error: err.message };
    }
  }

  /**
   * Model status and configuration
   */
  async getModelStatus() {
    try {
      const res = await fetch(`${this.baseUrl}/api/model/status`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      throw new Error(`Failed to load model status: ${err.message}`);
    }
  }

  /**
   * Supported vocabulary list
   */
  async getVocabulary() {
    try {
      const res = await fetch(`${this.baseUrl}/api/vocabulary`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      throw new Error(`Failed to fetch vocabulary: ${err.message}`);
    }
  }

  /**
   * Send a webcam frame for gesture classification
   * @param {string} base64Image - JPEG base64 string
   * @param {number|null} confidenceThreshold - Optional confidence override
   */
  async recognizeFrame(base64Image, confidenceThreshold = null) {
    try {
      const payload = { image: base64Image };
      if (confidenceThreshold !== null) {
        payload.confidence_threshold = confidenceThreshold;
      }

      const res = await fetch(`${this.baseUrl}/api/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      return {
        success: false,
        hand_detected: false,
        prediction: null,
        confidence: 0,
        stable_prediction: false,
        landmarks: [],
        message: err.message || 'Network request failed'
      };
    }
  }

  /**
   * Reset prediction smoothing buffer
   */
  async resetSmoothing() {
    try {
      await fetch(`${this.baseUrl}/api/recognize/reset`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Failed to reset smoothing buffer:', err);
    }
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
