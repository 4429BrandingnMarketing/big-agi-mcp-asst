// Renderer process script
let conversationHistory = [];

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const newChatBtn = document.getElementById('newChatBtn');
const charCount = document.getElementById('charCount');
const typingIndicator = document.getElementById('typingIndicator');
const appVersion = document.getElementById('appVersion');

// Initialize app
async function initializeApp() {
    // Load app version
    try {
        const version = await window.electronAPI.getAppVersion();
        appVersion.textContent = `v${version}`;
    } catch (error) {
        console.error('Error loading app version:', error);
    }

    // Setup event listeners
    setupEventListeners();

    // Auto-focus input
    messageInput.focus();
}

function setupEventListeners() {
    // Send button click
    sendButton.addEventListener('click', sendMessage);

    // Enter key to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
        updateCharCount();
    });

    // New chat button
    newChatBtn.addEventListener('click', startNewConversation);

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

function updateCharCount() {
    const count = messageInput.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;

    // Clear input and reset height
    messageInput.value = '';
    messageInput.style.height = 'auto';
    updateCharCount();

    // Remove welcome message if present
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    // Add user message to chat
    addMessageToChat('user', message);

    // Add to history
    conversationHistory.push({ role: 'user', content: message });

    // Show typing indicator
    showTypingIndicator(true);

    try {
        // Send message to main process and get AI response
        const response = await window.electronAPI.sendMessage(message);

        // Hide typing indicator
        showTypingIndicator(false);

        // Add AI response to chat
        addMessageToChat('assistant', response);

        // Add to history
        conversationHistory.push({ role: 'assistant', content: response });

    } catch (error) {
        showTypingIndicator(false);
        addMessageToChat('error', 'Sorry, there was an error processing your message. Please try again.');
        console.error('Error sending message:', error);
    }

    // Scroll to bottom
    scrollToBottom();
}

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';

    if (role === 'user') {
        avatar.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;
    } else if (role === 'assistant') {
        avatar.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
            </svg>
        `;
    } else {
        avatar.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    messageHeader.textContent = role === 'user' ? 'You' : role === 'assistant' ? 'AI Assistant' : 'System';

    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = content;

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString();

    messageContent.appendChild(messageHeader);
    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    chatMessages.appendChild(messageDiv);

    // Animate message
    setTimeout(() => {
        messageDiv.classList.add('visible');
    }, 10);
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
    // Clear conversation history
    conversationHistory = [];

    // Clear chat messages
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <h2>New Conversation Started</h2>
            <p>How can I assist you today?</p>
        </div>
    `;

    // Focus input
    messageInput.focus();
}

async function saveCurrentConversation() {
    if (conversationHistory.length === 0) {
        alert('No conversation to save!');
        return;
    }

    const conversationData = {
        timestamp: new Date().toISOString(),
        messages: conversationHistory
    };

    try {
        const result = await window.electronAPI.saveConversation(conversationData);
        if (result.success) {
            console.log('Conversation saved successfully');
        } else {
            console.error('Error saving conversation:', result.error);
        }
    } catch (error) {
        console.error('Error saving conversation:', error);
    }
}

function loadConversation(conversation) {
    if (!conversation || !conversation.messages) {
        alert('Invalid conversation data!');
        return;
    }

    // Clear current conversation
    chatMessages.innerHTML = '';
    conversationHistory = [];

    // Load messages
    conversation.messages.forEach(msg => {
        addMessageToChat(msg.role, msg.content);
        conversationHistory.push(msg);
    });

    scrollToBottom();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
