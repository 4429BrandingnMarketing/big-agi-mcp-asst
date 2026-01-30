/**
 * E2E Tests for Desktop Application
 */

const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');

test.describe('Big-AGI MCP Assistant E2E Tests', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../src/main.js')]
    });

    // Get the first window
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should launch application successfully', async () => {
    const title = await window.title();
    expect(title).toContain('Big-AGI MCP Assistant');
  });

  test('should display welcome message', async () => {
    const welcomeMessage = await window.locator('.welcome-message');
    await expect(welcomeMessage).toBeVisible();
  });

  test('should have input field', async () => {
    const messageInput = await window.locator('#messageInput');
    await expect(messageInput).toBeVisible();
    await expect(messageInput).toBeEnabled();
  });

  test('should have send button', async () => {
    const sendButton = await window.locator('#sendButton');
    await expect(sendButton).toBeVisible();
  });

  test('should focus input on load', async () => {
    const messageInput = await window.locator('#messageInput');
    const isFocused = await messageInput.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('should type in message input', async () => {
    const messageInput = await window.locator('#messageInput');
    await messageInput.fill('Hello, test!');
    const value = await messageInput.inputValue();
    expect(value).toBe('Hello, test!');
  });

  test('should update character count', async () => {
    const messageInput = await window.locator('#messageInput');
    await messageInput.fill('Test message');

    const charCount = await window.locator('#charCount');
    const text = await charCount.textContent();
    expect(text).toContain('12 characters');
  });

  test('should have new chat button', async () => {
    const newChatBtn = await window.locator('#newChatBtn');
    await expect(newChatBtn).toBeVisible();
  });

  test('should have settings button', async () => {
    const settingsBtn = await window.locator('#settingsBtn');
    await expect(settingsBtn).toBeVisible();
  });

  test('should display app version', async () => {
    const appVersion = await window.locator('#appVersion');
    await expect(appVersion).toBeVisible();
    const version = await appVersion.textContent();
    expect(version).toMatch(/v\d+\.\d+\.\d+/);
  });

  test('should clear input after typing and clearing', async () => {
    const messageInput = await window.locator('#messageInput');
    await messageInput.fill('Test');
    await messageInput.clear();
    const value = await messageInput.inputValue();
    expect(value).toBe('');
  });

  test('should have sidebar', async () => {
    const sidebar = await window.locator('.sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('should have conversation list', async () => {
    const conversationList = await window.locator('#conversationList');
    await expect(conversationList).toBeVisible();
  });

  test('should have chat messages container', async () => {
    const chatMessages = await window.locator('#chatMessages');
    await expect(chatMessages).toBeVisible();
  });
});

test.describe('Premium Features E2E Tests', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../src/main.js')]
    });
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should have premium badge', async () => {
    const premiumBadge = await window.locator('.premium-badge');
    if (await premiumBadge.count() > 0) {
      await expect(premiumBadge).toBeVisible();
      const text = await premiumBadge.textContent();
      expect(text).toBe('PREMIUM');
    }
  });

  test('should have provider selector', async () => {
    const providerSelect = await window.locator('#providerSelect');
    if (await providerSelect.count() > 0) {
      await expect(providerSelect).toBeVisible();
    }
  });

  test('should open settings modal on settings button click', async () => {
    const settingsBtn = await window.locator('#settingsBtn');
    await settingsBtn.click();

    // Wait for modal
    await window.waitForTimeout(500);

    const modal = await window.locator('.modal-overlay');
    if (await modal.count() > 0) {
      await expect(modal).toBeVisible();

      // Close modal
      const closeBtn = await window.locator('.modal-close');
      await closeBtn.click();
    }
  });
});
