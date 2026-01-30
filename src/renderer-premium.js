/**
 * PREMIUM Renderer Process
 * Enhanced with markdown, syntax highlighting, notifications, and more
 */

// Import markdown libraries (loaded via CDN in HTML)
let marked, hljs, DOMPurify;

// State
let conversationHistory = [];
let currentProvider = 'anthropic';
let availableProviders = [];

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const newChatBtn = document.getElementById('newChatBtn');
const settingsBtn = document.getElementById('settingsBtn');
const charCount = document.getElementById('charCount');
const typingIndicator = document.getElementById('typingIndicator');
const appVersion = document.getElementById('appVersion');
const providerSelect = document.getElementById('providerSelect');

// Initialize app
async function initializeApp() {
    // Wait for libraries to load
    await waitForLibraries();

    // Configure marked for markdown rendering
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });

    // Load app version
    try {
        const version = await window.electronAPI.getAppVersion();
        appVersion.textContent = `v${version}`;
    } catch (error) {
        console.error('Error loading app version:', error);
    }

    // Load available providers
    try {
        availableProviders = await window.electronAPI.getProviders();
        populateProviderSelect();
        currentProvider = await window.electronAPI.getActiveProvider();
        if (providerSelect) {
            providerSelect.value = currentProvider;
        }
    } catch (error) {
        console.error('Error loading providers:', error);
    }

    setupEventListeners();
    messageInput.focus();

    showToast('Welcome to Big-AGI MCP Assistant!', 'success');
}

function waitForLibraries() {
    return new Promise((resolve) => {
        const check = setInterval(() => {
            if (window.marked && window.hljs && window.DOMPurify) {
                marked = window.marked;
                hljs = window.hljs;
                DOMPurify = window.DOMPurify;
                clearInterval(check);
                resolve();
            }
        }, 100);
    });
}

function setupEventListeners() {
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
        updateCharCount();
    });

    newChatBtn.addEventListener('click', startNewConversation);

    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettings);
    }

    if (providerSelect) {
        providerSelect.addEventListener('change', async (e) => {
            await changeProvider(e.target.value);
        });
    }

    // IPC event listeners
    window.electronAPI.onNewConversation(() => {
        startNewConversation();
    });

    window.electronAPI.onSaveConversationRequest(() => {
        saveCurrentConversation();
    });

    window.electronAPI.onLoadConversation((conversation) => {
        loadConversation(conversation);
    });
}

function populateProviderSelect() {
    if (!providerSelect || availableProviders.length === 0) return;

    providerSelect.innerHTML = '';
    availableProviders.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider;
        option.textContent = formatProviderName(provider);
        providerSelect.appendChild(option);
    });
}

function formatProviderName(provider) {
    const names = {
        'openai': 'OpenAI (GPT-4)',
        'anthropic': 'Anthropic (Claude)',
        'openrouter': 'Open Router',
        'groq': 'Groq (Fast)',
        'google': 'Google Gemini',
        'kimi': 'Kimi',
        'huggingface': 'Hugging Face',
        'hyperbolic': 'Hyperbolic',
    };
    return names[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
}

async function changeProvider(provider) {
    try {
        await window.electronAPI.setProvider(provider);
        currentProvider = provider;
        showToast(`Switched to ${formatProviderName(provider)}`, 'success');
    } catch (error) {
        showToast(`Failed to switch provider: ${error.message}`, 'error');
    }
}

function updateCharCount() {
    const count = messageInput.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;

    messageInput.value = '';
    messageInput.style.height = 'auto';
    updateCharCount();

    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    addMessageToChat('user', message);
    conversationHistory.push({ role: 'user', content: message });

    showTypingIndicator(true);

    try {
        const response = await window.electronAPI.sendMessage(message);
        showTypingIndicator(false);
        addMessageToChat('assistant', response);
        conversationHistory.push({ role: 'assistant', content: response });
    } catch (error) {
        showTypingIndicator(false);
        addMessageToChat('error', 'Sorry, there was an error processing your message. Please check your API configuration.');
        console.error('Error sending message:', error);
        showToast('Error sending message', 'error');
    }

    scrollToBottom();
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = getAvatarIcon(role);

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';

    const headerText = document.createElement('span');
    headerText.textContent = role === 'user' ? 'You' : role === 'assistant' ? `AI (${formatProviderName(currentProvider)})` : 'System';
    messageHeader.appendChild(headerText);

    // Add copy button
    if (role !== 'error') {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        `;
        copyBtn.title = 'Copy to clipboard';
        copyBtn.onclick = () => copyToClipboard(content, copyBtn);
        messageHeader.appendChild(copyBtn);
    }

    const messageText = document.createElement('div');
    messageText.className = 'message-text';

    // Render markdown for assistant messages
    if (role === 'assistant') {
        const html = marked.parse(content);
        messageText.innerHTML = DOMPurify.sanitize(html);

        // Add copy buttons to code blocks
        messageText.querySelectorAll('pre code').forEach((block, index) => {
            const pre = block.parentElement;
            pre.style.position = 'relative';

            const copyCodeBtn = document.createElement('button');
            copyCodeBtn.className = 'copy-code-btn';
            copyCodeBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            `;
            copyCodeBtn.title = 'Copy code';
            copyCodeBtn.onclick = () => copyToClipboard(block.textContent, copyCodeBtn);
            pre.appendChild(copyCodeBtn);
        });
    } else {
        messageText.textContent = content;
    }

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString();

    messageContent.appendChild(messageHeader);
    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    chatMessages.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add('visible');
    }, 10);
}

function getAvatarIcon(role) {
    if (role === 'user') {
        return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;
    } else if (role === 'assistant') {
        return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
            </svg>
        `;
    } else {
        return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    }
}

async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);

        const originalHTML = button.innerHTML;
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);

        showToast('Copied to clipboard!', 'success');
    } catch (error) {
        showToast('Failed to copy', 'error');
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = {
        success: '✓',
        error: '✕',
        info: 'ⓘ',
        warning: '⚠'
    }[type] || 'ⓘ';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showTypingIndicator(show) {
    typingIndicator.style.display = show ? 'flex' : 'none';
    if (show) {
        scrollToBottom();
    }
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function startNewConversation() {
    conversationHistory = [];
    chatMessages.innerHTML = `
        <div class="welcome-message fade-in">
            <h2>New Conversation Started</h2>
            <p>How can I assist you today?</p>
        </div>
    `;
    messageInput.focus();
    showToast('New conversation started', 'info');
}

async function saveCurrentConversation() {
    if (conversationHistory.length === 0) {
        showToast('No conversation to save!', 'warning');
        return;
    }

    const conversationData = {
        timestamp: new Date().toISOString(),
        provider: currentProvider,
        messages: conversationHistory
    };

    try {
        const result = await window.electronAPI.saveConversation(conversationData);
        if (result.success) {
            showToast('Conversation saved successfully!', 'success');
        } else {
            showToast('Error saving conversation', 'error');
        }
    } catch (error) {
        console.error('Error saving conversation:', error);
        showToast('Error saving conversation', 'error');
    }
}

function loadConversation(conversation) {
    if (!conversation || !conversation.messages) {
        showToast('Invalid conversation data!', 'error');
        return;
    }

    chatMessages.innerHTML = '';
    conversationHistory = [];

    conversation.messages.forEach(msg => {
        addMessageToChat(msg.role, msg.content);
        conversationHistory.push(msg);
    });

    scrollToBottom();
    showToast('Conversation loaded successfully!', 'success');
}

function openSettings() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content settings-modal">
            <div class="modal-header">
                <h2>Settings</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="settings-section">
                    <h3>AI Provider</h3>
                    <div class="setting-item">
                        <label>Active Provider:</label>
                        <select id="modalProviderSelect" class="setting-select">
                            ${availableProviders.map(p => `
                                <option value="${p}" ${p === currentProvider ? 'selected' : ''}>
                                    ${formatProviderName(p)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Available Providers:</label>
                        <div class="provider-list">
                            ${availableProviders.map(p => `
                                <span class="provider-badge">${formatProviderName(p)}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Export</h3>
                    <button class="btn-primary" onclick="exportConversationToMarkdown()">
                        Export to Markdown
                    </button>
                    <button class="btn-secondary" onclick="exportConversationToJSON()">
                        Export to JSON
                    </button>
                </div>

                <div class="settings-section">
                    <h3>About</h3>
                    <p>Big-AGI MCP Assistant ${appVersion.textContent}</p>
                    <p>A premium desktop application for AI-powered assistance.</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('modalProviderSelect').addEventListener('change', async (e) => {
        await changeProvider(e.target.value);
        if (providerSelect) {
            providerSelect.value = e.target.value;
        }
    });

    setTimeout(() => modal.classList.add('show'), 10);
}

async function exportConversationToMarkdown() {
    if (conversationHistory.length === 0) {
        showToast('No conversation to export!', 'warning');
        return;
    }

    let markdown = `# Conversation Export\n\n`;
    markdown += `**Date:** ${new Date().toLocaleString()}\n`;
    markdown += `**Provider:** ${formatProviderName(currentProvider)}\n\n`;
    markdown += `---\n\n`;

    conversationHistory.forEach((msg, index) => {
        const role = msg.role === 'user' ? '👤 You' : '🤖 AI Assistant';
        markdown += `### ${role}\n\n`;
        markdown += `${msg.content}\n\n`;
        if (index < conversationHistory.length - 1) {
            markdown += `---\n\n`;
        }
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Exported to Markdown!', 'success');
}

async function exportConversationToJSON() {
    if (conversationHistory.length === 0) {
        showToast('No conversation to export!', 'warning');
        return;
    }

    const data = {
        timestamp: new Date().toISOString(),
        provider: currentProvider,
        messages: conversationHistory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Exported to JSON!', 'success');
}

// Make functions globally available
window.exportConversationToMarkdown = exportConversationToMarkdown;
window.exportConversationToJSON = exportConversationToJSON;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
