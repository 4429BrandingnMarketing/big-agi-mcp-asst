# API Integration Guide

This guide explains how to integrate your APIs into the Big-AGI MCP Desktop Application.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [Integration Methods](#integration-methods)
4. [API Service Usage](#api-service-usage)
5. [Examples](#examples)
6. [Security Best Practices](#security-best-practices)

---

## Quick Start

### 1. Configure Your API

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API credentials:

```env
API_BASE_URL=https://your-api.com
API_KEY=your_secret_api_key
```

### 2. Choose Integration Method

**Option A: Use the API service with existing main.js**

```javascript
// In src/main.js, replace the generateAIResponse function:
const { initializeAPI } = require('./api-service');
const { getConfig } = require('./config');

// Initialize in app.whenReady()
const config = getConfig();
const apiService = initializeAPI(config.get('api'));

// Update generateAIResponse
async function generateAIResponse(message) {
  try {
    const response = await apiService.chat(message);
    return response.data.content; // Adjust based on your API
  } catch (error) {
    return `Error: ${error.message}`;
  }
}
```

**Option B: Use the complete API-integrated version**

```bash
# Backup original
mv src/main.js src/main.backup.js

# Use API-integrated version
mv src/main-with-api.js src/main.js
```

### 3. Install Dependencies (if needed)

```bash
# For environment variables
npm install dotenv --save

# For advanced HTTP features
npm install axios --save

# For WebSocket support
npm install ws --save
```

---

## Configuration

### Environment Variables

The app supports environment variables through `.env` file:

```env
API_BASE_URL=https://api.example.com
API_KEY=your_api_key_here
API_TIMEOUT=30000
```

Load them in your app:

```javascript
// At the top of src/main.js
require('dotenv').config();

// Access them
const apiKey = process.env.API_KEY;
```

### Config File

The app includes a configuration system (`src/config.js`):

```javascript
const { getConfig } = require('./config');
const config = getConfig();

// Get values
const apiKey = config.get('api.apiKey');
const baseURL = config.get('api.baseURL');

// Set values
config.set('api.apiKey', 'new-key');

// Get all config
const allConfig = config.getAll();
```

---

## Integration Methods

### Method 1: REST API Integration

```javascript
const { APIService } = require('./api-service');

const api = new APIService({
  baseURL: 'https://your-api.com',
  apiKey: 'your-key',
  headers: {
    'X-Custom-Header': 'value'
  }
});

// GET request
const data = await api.get('/endpoint');

// POST request
const result = await api.post('/endpoint', { key: 'value' });

// PUT request
const updated = await api.put('/endpoint', { key: 'newValue' });

// DELETE request
await api.delete('/endpoint');
```

### Method 2: WebSocket Integration

Create `src/websocket-service.js`:

```javascript
const WebSocket = require('ws');

class WebSocketService {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        console.log('WebSocket connected');
        resolve();
      });

      this.ws.on('message', (data) => {
        const message = JSON.parse(data);
        const callback = this.callbacks.get(message.id);
        if (callback) {
          callback(message);
          this.callbacks.delete(message.id);
        }
      });

      this.ws.on('error', reject);
    });
  }

  send(data) {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString();
      const message = { id, ...data };

      this.callbacks.set(id, resolve);
      this.ws.send(JSON.stringify(message));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.callbacks.has(id)) {
          this.callbacks.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

module.exports = WebSocketService;
```

### Method 3: GraphQL Integration

```javascript
class GraphQLService {
  constructor(endpoint, apiKey) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async query(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ query, variables })
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }
}
```

---

## API Service Usage

### Basic Usage

```javascript
const { getAPIService } = require('./api-service');

// Get the initialized service
const api = getAPIService();

// Make requests
async function fetchData() {
  try {
    const response = await api.get('/data');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Advanced Usage

```javascript
// Custom endpoint with retry logic
async function callAPIWithRetry(endpoint, maxRetries = 3) {
  const api = getAPIService();

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await api.get(endpoint);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Batch requests
async function batchRequests(requests) {
  const api = getAPIService();
  return Promise.all(
    requests.map(req => api.request(req.endpoint, req.options))
  );
}

// Stream handling
async function streamAPI(endpoint, onData) {
  const api = getAPIService();
  // Implement streaming based on your API
}
```

---

## Examples

### Example 1: OpenAI Integration

```javascript
const { APIService } = require('./api-service');

const openai = new APIService({
  baseURL: 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY
});

async function chatWithOpenAI(message) {
  const response = await openai.post('/chat/completions', {
    model: 'gpt-4',
    messages: [
      { role: 'user', content: message }
    ]
  });

  return response.data.choices[0].message.content;
}
```

### Example 2: Anthropic Claude Integration

```javascript
const { APIService } = require('./api-service');

const anthropic = new APIService({
  baseURL: 'https://api.anthropic.com/v1',
  apiKey: process.env.ANTHROPIC_API_KEY,
  headers: {
    'anthropic-version': '2023-06-01'
  }
});

async function chatWithClaude(message) {
  const response = await anthropic.post('/messages', {
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: message }
    ]
  });

  return response.data.content[0].text;
}
```

### Example 3: Custom API with Authentication

```javascript
const { APIService } = require('./api-service');

class CustomAPI extends APIService {
  constructor(config) {
    super(config);
    this.token = null;
  }

  async authenticate(username, password) {
    const response = await this.post('/auth/login', {
      username,
      password
    });
    this.token = response.data.token;
    this.headers['Authorization'] = `Bearer ${this.token}`;
  }

  async getUserData() {
    return this.get('/user/profile');
  }

  async sendMessage(message) {
    return this.post('/messages', { content: message });
  }
}

// Usage
const customAPI = new CustomAPI({
  baseURL: 'https://your-api.com'
});

await customAPI.authenticate('user', 'pass');
const userData = await customAPI.getUserData();
```

### Example 4: Multiple API Integration

```javascript
// Initialize multiple APIs
const services = {
  primary: new APIService({
    baseURL: process.env.PRIMARY_API_URL,
    apiKey: process.env.PRIMARY_API_KEY
  }),
  secondary: new APIService({
    baseURL: process.env.SECONDARY_API_URL,
    apiKey: process.env.SECONDARY_API_KEY
  }),
  analytics: new APIService({
    baseURL: process.env.ANALYTICS_API_URL,
    apiKey: process.env.ANALYTICS_API_KEY
  })
};

// Use them together
async function processWithMultipleAPIs(data) {
  const [result1, result2, analytics] = await Promise.all([
    services.primary.post('/process', data),
    services.secondary.post('/analyze', data),
    services.analytics.post('/track', { event: 'process', data })
  ]);

  return {
    primary: result1.data,
    secondary: result2.data,
    tracked: analytics.data
  };
}
```

---

## Security Best Practices

### 1. Store API Keys Securely

```javascript
// ❌ DON'T: Hardcode API keys
const apiKey = 'sk-1234567890abcdef';

// ✅ DO: Use environment variables
const apiKey = process.env.API_KEY;

// ✅ DO: Use secure storage
const { getConfig } = require('./config');
const config = getConfig();
const apiKey = config.get('api.apiKey');
```

### 2. Validate Input

```javascript
function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }
  if (message.length > 10000) {
    throw new Error('Message too long');
  }
  return message.trim();
}

// Use in handlers
ipcMain.handle('send-message', async (event, message) => {
  const validMessage = validateMessage(message);
  return await apiService.chat(validMessage);
});
```

### 3. Handle Errors Gracefully

```javascript
async function safeAPICall(apiFunction, fallback) {
  try {
    return await apiFunction();
  } catch (error) {
    console.error('API Error:', error);
    return fallback || 'An error occurred';
  }
}
```

### 4. Rate Limiting

```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.throttle();
    }

    this.requests.push(now);
  }
}

// Usage
const limiter = new RateLimiter(10, 60000); // 10 requests per minute

async function limitedAPICall(endpoint) {
  await limiter.throttle();
  return api.get(endpoint);
}
```

### 5. Secure IPC Communication

```javascript
// In preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // ✅ Expose specific, validated functions
  sendMessage: (msg) => {
    if (typeof msg !== 'string' || msg.length > 10000) {
      throw new Error('Invalid message');
    }
    return ipcRenderer.invoke('send-message', msg);
  },

  // ❌ Don't expose raw IPC
  // invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
});
```

---

## Testing Your Integration

Create `test-api.js`:

```javascript
const { initializeAPI } = require('./src/api-service');

async function testAPI() {
  const api = initializeAPI({
    baseURL: process.env.API_BASE_URL,
    apiKey: process.env.API_KEY
  });

  try {
    console.log('Testing API connection...');

    const response = await api.get('/health');
    console.log('✅ API is healthy:', response.data);

    const chatResponse = await api.chat('Hello!');
    console.log('✅ Chat working:', chatResponse.data);

    console.log('All tests passed!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
```

Run with:
```bash
node test-api.js
```

---

## Next Steps

1. **Configure your API credentials** in `.env`
2. **Choose an integration method** based on your API type
3. **Update the main process** to use your API
4. **Test the integration** with your API endpoints
5. **Deploy** your standalone desktop app

For more help, see the main README.md or open an issue.
