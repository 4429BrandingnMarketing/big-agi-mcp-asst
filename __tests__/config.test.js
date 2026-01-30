/**
 * Unit Tests for Configuration Manager
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock electron app
jest.mock('electron', () => ({
  app: {
    getPath: () => os.tmpdir()
  }
}), { virtual: true });

const { getConfig } = require('../src/config');

describe('Configuration Manager', () => {
  let config;
  let testConfigPath;

  beforeEach(() => {
    config = getConfig();
    testConfigPath = path.join(os.tmpdir(), 'config.json');

    // Clean up any existing test config
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  afterEach(() => {
    // Clean up test config file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      const allConfig = config.getAll();
      expect(allConfig).toHaveProperty('api');
      expect(allConfig).toHaveProperty('app');
      expect(allConfig).toHaveProperty('endpoints');
    });

    test('should have default API settings', () => {
      const apiConfig = config.get('api');
      expect(apiConfig).toHaveProperty('baseURL');
      expect(apiConfig).toHaveProperty('timeout');
      expect(apiConfig.timeout).toBe(30000);
    });

    test('should have default app settings', () => {
      const appConfig = config.get('app');
      expect(appConfig).toHaveProperty('theme');
      expect(appConfig).toHaveProperty('language');
      expect(appConfig.theme).toBe('dark');
    });
  });

  describe('Get/Set Operations', () => {
    test('should get nested configuration values', () => {
      const theme = config.get('app.theme');
      expect(theme).toBe('dark');
    });

    test('should set nested configuration values', () => {
      config.set('app.theme', 'light');
      expect(config.get('app.theme')).toBe('light');
    });

    test('should create nested paths when setting', () => {
      config.set('custom.nested.value', 'test');
      expect(config.get('custom.nested.value')).toBe('test');
    });

    test('should return undefined for non-existent keys', () => {
      const result = config.get('non.existent.key');
      expect(result).toBeUndefined();
    });
  });

  describe('Persistence', () => {
    test('should save configuration to file', () => {
      const result = config.save();
      expect(result).toBe(true);
    });

    test('should load configuration from file', () => {
      config.set('test.value', 'loaded');
      config.save();

      const newConfig = getConfig();
      const loaded = newConfig.load();
      expect(loaded).toHaveProperty('test');
    });
  });

  describe('Reset', () => {
    test('should reset to default configuration', () => {
      config.set('app.theme', 'custom');
      config.reset();
      expect(config.get('app.theme')).toBe('dark');
    });

    test('should remove custom settings on reset', () => {
      config.set('custom.setting', 'value');
      config.reset();
      expect(config.get('custom.setting')).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid configuration gracefully', () => {
      expect(() => {
        config.get(null);
      }).not.toThrow();
    });

    test('should handle file system errors', () => {
      // This should not throw even if file operations fail
      expect(() => {
        config.save();
      }).not.toThrow();
    });
  });
});
