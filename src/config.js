/**
 * Application Configuration
 * Centralized configuration for API endpoints and settings
 */

const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class Config {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.defaultConfig = {
      api: {
        baseURL: process.env.API_BASE_URL || 'https://api.example.com',
        apiKey: process.env.API_KEY || '',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      },
      app: {
        theme: 'dark',
        language: 'en',
        notifications: true,
        autoSave: true
      },
      endpoints: {
        // Define your API endpoints here
        chat: '/api/v1/chat',
        completion: '/api/v1/completions',
        analytics: '/api/v1/analytics',
        users: '/api/v1/users',
        settings: '/api/v1/settings'
      }
    };

    this.config = this.load();
  }

  /**
   * Load configuration from file
   */
  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        return { ...this.defaultConfig, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    return this.defaultConfig;
  }

  /**
   * Save configuration to file
   */
  save() {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  /**
   * Get configuration value
   */
  get(key) {
    const keys = key.split('.');
    let value = this.config;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    const keys = key.split('.');
    let target = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
    this.save();
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Reset to default configuration
   */
  reset() {
    this.config = { ...this.defaultConfig };
    this.save();
  }
}

// Export singleton
let configInstance = null;

function getConfig() {
  if (!configInstance) {
    configInstance = new Config();
  }
  return configInstance;
}

module.exports = { getConfig };
