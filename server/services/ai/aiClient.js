const axios = require('axios');

/**
 * Unified AI Client
 * Works with Google Gemini API, OpenAI-compatible APIs, or gracefully delegates
 * to local heuristic NLP when no API key is provided.
 */
class AIClient {
  constructor() {
    this.apiKey = process.env.AI_API_KEY || '';
    this.model = process.env.AI_MODEL || 'gemini-1.5-flash';
    this.baseUrl = process.env.AI_API_BASE_URL || '';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Calls LLM with a system prompt and user prompt, expecting JSON output
   */
  async generateJSON(prompt, systemInstruction = '') {
    if (!this.isConfigured()) {
      return null; // Signals fallback to local heuristics
    }

    try {
      // Determine if Google Gemini format or OpenAI-compatible format
      if (this.baseUrl.includes('googleapis') || (!this.baseUrl && this.model.includes('gemini'))) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
        const body = {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${prompt}\n\nIMPORTANT: Return ONLY valid JSON.` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        };

        const res = await axios.post(url, body, { timeout: 20000 });
        const text = res.data.candidates[0].content.parts[0].text;
        return JSON.parse(text);
      } else {
        // OpenAI-compatible format (OpenAI, Groq, Together, Ollama, etc.)
        const endpoint = this.baseUrl ? `${this.baseUrl}/chat/completions` : 'https://api.openai.com/v1/chat/completions';
        const res = await axios.post(
          endpoint,
          {
            model: this.model || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemInstruction + ' Return valid JSON only.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );

        const content = res.data.choices[0].message.content;
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn(`[AIClient] External AI call failed (${err.message}). Using built-in local heuristics.`);
      return null;
    }
  }
}

module.exports = new AIClient();
