/**
 * Multi-API Manager
 * Handles integration with all your API services
 */

require('dotenv').config();
const { APIService } = require('./api-service');

class MultiAPIManager {
  constructor() {
    this.providers = {};
    this.activeProvider = process.env.DEFAULT_AI_PROVIDER || 'anthropic';
    this.initializeProviders();
  }

  /**
   * Initialize all API providers
   */
  initializeProviders() {
    // AI Chat Providers
    if (process.env.OPENAI_API_KEY) {
      this.providers.openai = new APIService({
        baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.anthropic = new APIService({
        baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
        apiKey: process.env.ANTHROPIC_API_KEY,
        headers: {
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      });
    }

    if (process.env.OPEN_ROUTER_API_KEY) {
      this.providers.openrouter = new APIService({
        baseURL: process.env.OPEN_ROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPEN_ROUTER_API_KEY
      });
    }

    if (process.env.GROQ_API_KEY) {
      this.providers.groq = new APIService({
        baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY
      });
    }

    if (process.env.GOOGLE_API_KEY) {
      this.providers.google = new APIService({
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: process.env.GOOGLE_API_KEY
      });
    }

    if (process.env.KIMI_API_KEY) {
      this.providers.kimi = new APIService({
        baseURL: 'https://api.moonshot.cn/v1',
        apiKey: process.env.KIMI_API_KEY
      });
    }

    if (process.env.HUGGING_FACE_API_KEY) {
      this.providers.huggingface = new APIService({
        baseURL: 'https://api-inference.huggingface.co/models',
        apiKey: process.env.HUGGING_FACE_API_KEY
      });
    }

    if (process.env.HYPERBOLIC_API_KEY) {
      this.providers.hyperbolic = new APIService({
        baseURL: 'https://api.hyperbolic.xyz/v1',
        apiKey: process.env.HYPERBOLIC_API_KEY
      });
    }

    console.log(`Initialized ${Object.keys(this.providers).length} API providers`);
  }

  /**
   * Send chat message using active provider
   */
  async chat(message, context = [], options = {}) {
    const provider = options.provider || this.activeProvider;

    if (!this.providers[provider]) {
      throw new Error(`Provider "${provider}" not initialized. Check your .env file.`);
    }

    try {
      switch (provider) {
        case 'openai':
        case 'openrouter':
        case 'groq':
        case 'kimi':
          return await this.chatOpenAIFormat(provider, message, context, options);

        case 'anthropic':
          return await this.chatAnthropic(message, context, options);

        case 'google':
          return await this.chatGoogle(message, context, options);

        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error with provider ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Chat using OpenAI-compatible format
   */
  async chatOpenAIFormat(provider, message, context, options) {
    const messages = [
      ...context,
      { role: 'user', content: message }
    ];

    const response = await this.providers[provider].post('/chat/completions', {
      model: options.model || this.getDefaultModel(provider),
      messages,
      max_tokens: options.max_tokens || parseInt(process.env.MAX_TOKENS) || 4096,
      temperature: options.temperature || parseFloat(process.env.TEMPERATURE) || 0.7
    });

    return response.data.choices[0].message.content;
  }

  /**
   * Chat using Anthropic format
   */
  async chatAnthropic(message, context, options) {
    const messages = [
      ...context,
      { role: 'user', content: message }
    ];

    const response = await this.providers.anthropic.post('/messages', {
      model: options.model || process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      max_tokens: options.max_tokens || parseInt(process.env.MAX_TOKENS) || 4096,
      messages
    });

    return response.data.content[0].text;
  }

  /**
   * Chat using Google Gemini
   */
  async chatGoogle(message, context, options) {
    const model = options.model || 'gemini-pro';

    const response = await this.providers.google.post(
      `/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{
          parts: [{ text: message }]
        }]
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  }

  /**
   * Get default model for provider
   */
  getDefaultModel(provider) {
    const models = {
      openai: process.env.OPENAI_MODEL || 'gpt-4',
      anthropic: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      groq: 'llama-3.1-70b-versatile',
      kimi: 'moonshot-v1-8k',
      openrouter: 'anthropic/claude-3-opus'
    };

    return models[provider] || 'gpt-4';
  }

  /**
   * Set active provider
   */
  setProvider(provider) {
    if (!this.providers[provider]) {
      throw new Error(`Provider "${provider}" not available`);
    }
    this.activeProvider = provider;
    return true;
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Get active provider
   */
  getActiveProvider() {
    return this.activeProvider;
  }

  /**
   * Search with SerpAPI
   */
  async search(query) {
    if (!process.env.SERPAPI_API_KEY) {
      throw new Error('SERPAPI_API_KEY not configured');
    }

    const serpapi = new APIService({
      baseURL: 'https://serpapi.com',
      apiKey: process.env.SERPAPI_API_KEY
    });

    const response = await serpapi.get('/search', {
      q: query,
      api_key: process.env.SERPAPI_API_KEY
    });

    return response.data;
  }

  /**
   * Text to Speech with Eleven Labs
   */
  async textToSpeech(text, voiceId = 'default') {
    if (!process.env.ELEVEN_LABS_API_KEY) {
      throw new Error('ELEVEN_LABS_API_KEY not configured');
    }

    const elevenlabs = new APIService({
      baseURL: 'https://api.elevenlabs.io/v1',
      apiKey: process.env.ELEVEN_LABS_API_KEY
    });

    const response = await elevenlabs.post(`/text-to-speech/${voiceId}`, {
      text,
      model_id: 'eleven_monolingual_v1'
    });

    return response.data;
  }

  /**
   * Generate image with Stable Diffusion
   */
  async generateImage(prompt) {
    if (!process.env.STABLE_DIFFUSION_KEY) {
      throw new Error('STABLE_DIFFUSION_KEY not configured');
    }

    const sd = new APIService({
      baseURL: 'https://api.stability.ai/v1',
      apiKey: process.env.STABLE_DIFFUSION_KEY
    });

    const response = await sd.post('/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      samples: 1
    });

    return response.data;
  }

  /**
   * Store memory with Mem0
   */
  async storeMemory(data) {
    if (!process.env.MEM0_API_KEY) {
      throw new Error('MEM0_API_KEY not configured');
    }

    const mem0 = new APIService({
      baseURL: 'https://api.mem0.ai/v1',
      apiKey: process.env.MEM0_API_KEY
    });

    return await mem0.post('/memories', data);
  }

  /**
   * GitHub API operations
   */
  async githubOperation(endpoint, method = 'GET', data = null) {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN not configured');
    }

    const github = new APIService({
      baseURL: 'https://api.github.com',
      apiKey: process.env.GITHUB_TOKEN,
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const options = { method };
    if (data) options.body = data;

    return await github.request(endpoint, options);
  }

  /**
   * Supabase operations
   */
  getSupabaseClient() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    return new APIService({
      baseURL: process.env.SUPABASE_URL,
      apiKey: process.env.SUPABASE_ANON_KEY,
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      totalProviders: Object.keys(this.providers).length,
      activeProvider: this.activeProvider,
      availableProviders: this.getAvailableProviders(),
      configuredServices: {
        ai: this.getAvailableProviders().length,
        search: !!process.env.SERPAPI_API_KEY,
        tts: !!process.env.ELEVEN_LABS_API_KEY,
        imageGen: !!process.env.STABLE_DIFFUSION_KEY,
        memory: !!process.env.MEM0_API_KEY,
        github: !!process.env.GITHUB_TOKEN,
        database: !!process.env.SUPABASE_URL
      }
    };
  }
}

// Export singleton
let apiManager = null;

function getAPIManager() {
  if (!apiManager) {
    apiManager = new MultiAPIManager();
  }
  return apiManager;
}

module.exports = {
  MultiAPIManager,
  getAPIManager
};
