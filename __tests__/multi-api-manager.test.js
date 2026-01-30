/**
 * Unit Tests for Multi-API Manager
 */

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.DEFAULT_AI_PROVIDER = 'anthropic';

const { MultiAPIManager } = require('../src/multi-api-manager');

describe('MultiAPIManager', () => {
  let manager;

  beforeEach(() => {
    manager = new MultiAPIManager();
  });

  describe('Initialization', () => {
    test('should initialize with configured providers', () => {
      const providers = manager.getAvailableProviders();
      expect(providers).toContain('anthropic');
      expect(providers).toContain('openai');
      expect(providers.length).toBeGreaterThan(0);
    });

    test('should set default active provider', () => {
      const activeProvider = manager.getActiveProvider();
      expect(activeProvider).toBe('anthropic');
    });

    test('should initialize only configured providers', () => {
      const providers = manager.getAvailableProviders();
      // Should only include providers with API keys
      providers.forEach(provider => {
        expect(manager.providers[provider]).toBeDefined();
      });
    });
  });

  describe('Provider Management', () => {
    test('should switch active provider', () => {
      const result = manager.setProvider('openai');
      expect(result).toBe(true);
      expect(manager.getActiveProvider()).toBe('openai');
    });

    test('should throw error for invalid provider', () => {
      expect(() => {
        manager.setProvider('invalid-provider');
      }).toThrow();
    });

    test('should list all available providers', () => {
      const providers = manager.getAvailableProviders();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });
  });

  describe('Model Selection', () => {
    test('should return correct default model for OpenAI', () => {
      const model = manager.getDefaultModel('openai');
      expect(model).toBe('gpt-4');
    });

    test('should return correct default model for Anthropic', () => {
      const model = manager.getDefaultModel('anthropic');
      expect(model).toContain('claude');
    });

    test('should handle unknown providers gracefully', () => {
      const model = manager.getDefaultModel('unknown');
      expect(model).toBe('gpt-4'); // fallback
    });
  });

  describe('Statistics', () => {
    test('should return service statistics', () => {
      const stats = manager.getStats();
      expect(stats).toHaveProperty('totalProviders');
      expect(stats).toHaveProperty('activeProvider');
      expect(stats).toHaveProperty('availableProviders');
      expect(stats).toHaveProperty('configuredServices');
    });

    test('should count providers correctly', () => {
      const stats = manager.getStats();
      expect(stats.totalProviders).toBeGreaterThan(0);
      expect(stats.totalProviders).toBe(stats.availableProviders.length);
    });

    test('should report configured services', () => {
      const stats = manager.getStats();
      expect(stats.configuredServices).toHaveProperty('ai');
      expect(stats.configuredServices.ai).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing API keys gracefully', () => {
      // Manager should initialize even with some missing keys
      expect(manager.providers).toBeDefined();
      expect(Object.keys(manager.providers).length).toBeGreaterThan(0);
    });

    test('should validate provider before switching', () => {
      expect(() => {
        manager.setProvider('non-existent');
      }).toThrow('not available');
    });
  });
});
