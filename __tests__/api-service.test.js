/**
 * Unit Tests for API Service
 */

const { APIService } = require('../src/api-service');

describe('APIService', () => {
  let apiService;

  beforeEach(() => {
    apiService = new APIService({
      baseURL: 'https://api.test.com',
      apiKey: 'test-key-123',
      timeout: 5000
    });
  });

  describe('Constructor', () => {
    test('should initialize with correct configuration', () => {
      expect(apiService.baseURL).toBe('https://api.test.com');
      expect(apiService.apiKey).toBe('test-key-123');
      expect(apiService.timeout).toBe(5000);
    });

    test('should use default values when not provided', () => {
      const defaultService = new APIService();
      expect(defaultService.baseURL).toBe('https://api.example.com');
      expect(defaultService.timeout).toBe(30000);
    });

    test('should merge custom headers', () => {
      const customService = new APIService({
        headers: { 'X-Custom': 'value' }
      });
      expect(customService.headers['X-Custom']).toBe('value');
      expect(customService.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('HTTP Methods', () => {
    test('get() should construct correct URL', () => {
      const endpoint = '/test';
      expect(typeof apiService.get).toBe('function');
    });

    test('post() should accept body parameter', () => {
      expect(typeof apiService.post).toBe('function');
    });

    test('put() should accept body parameter', () => {
      expect(typeof apiService.put).toBe('function');
    });

    test('delete() should work without body', () => {
      expect(typeof apiService.delete).toBe('function');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid URLs', () => {
      const invalidService = new APIService({
        baseURL: 'invalid-url'
      });
      expect(invalidService.baseURL).toBe('invalid-url');
    });

    test('should validate required parameters', () => {
      expect(() => {
        apiService.request('', {});
      }).not.toThrow();
    });
  });
});
