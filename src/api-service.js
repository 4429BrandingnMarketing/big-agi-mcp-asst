/**
 * API Service Module
 * Centralized API integration for the desktop app
 */

const https = require('https');
const http = require('http');

class APIService {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://api.example.com';
    this.apiKey = config.apiKey || process.env.API_KEY;
    this.timeout = config.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...config.headers
    };
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = new URL(endpoint, this.baseURL);
    const protocol = url.protocol === 'https:' ? https : http;

    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        ...this.headers,
        ...options.headers
      },
      timeout: this.timeout
    };

    return new Promise((resolve, reject) => {
      const req = protocol.request(url, requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = {
              status: res.statusCode,
              headers: res.headers,
              data: data ? JSON.parse(data) : null
            };

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const url = new URL(endpoint, this.baseURL);
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, params[key])
    );
    return this.request(url.toString(), { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Chat completion API (example for AI services)
   */
  async chat(message, context = []) {
    return this.post('/chat/completions', {
      messages: [
        ...context,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
  }

  /**
   * Multiple API endpoints example
   */
  async getAnalytics(params) {
    return this.get('/analytics', params);
  }

  async processData(data) {
    return this.post('/process', data);
  }

  async getUserProfile(userId) {
    return this.get(`/users/${userId}`);
  }

  async updateSettings(settings) {
    return this.put('/settings', settings);
  }
}

// Export singleton instance
let apiService = null;

function initializeAPI(config) {
  apiService = new APIService(config);
  return apiService;
}

function getAPIService() {
  if (!apiService) {
    throw new Error('API Service not initialized. Call initializeAPI() first.');
  }
  return apiService;
}

module.exports = {
  APIService,
  initializeAPI,
  getAPIService
};
