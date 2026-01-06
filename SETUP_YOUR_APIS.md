# 🚀 Setup Your APIs - Quick Start Guide

## ⚠️ CRITICAL: Secure Your API Keys

**BEFORE YOU START:**
1. **NEVER** commit API keys to git
2. **NEVER** share API keys in chat or public places
3. **ALWAYS** use environment variables
4. **REVOKE** any exposed keys immediately

---

## 📋 Step-by-Step Setup

### Step 1: Create Your Environment File

```bash
# Copy the example file
cp .env.example .env

# Open in your editor
nano .env   # or use any text editor
```

### Step 2: Add Your REAL API Keys

Edit `.env` and replace the placeholder values with your actual keys:

```env
# Example - Replace with YOUR keys
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_KEY_HERE
OPENAI_API_KEY=sk-YOUR_ACTUAL_KEY_HERE
OPEN_ROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY_HERE
# ... etc
```

### Step 3: Verify .gitignore

Ensure `.env` is in `.gitignore` (it already is!):

```bash
# Check that .env is ignored
cat .gitignore | grep .env
# Should show: .env
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Test Your Setup

Create a test file `test-setup.js`:

```javascript
require('dotenv').config();
const { getAPIManager } = require('./src/multi-api-manager');

async function test() {
  const manager = getAPIManager();

  console.log('📊 API Setup Status:');
  console.log(manager.getStats());

  console.log('\n Available AI Providers:');
  manager.getAvailableProviders().forEach(p => {
    console.log(`  ✅ ${p}`);
  });

  // Test chat
  if (manager.getAvailableProviders().length > 0) {
    console.log('\n🧪 Testing chat...');
    try {
      const response = await manager.chat('Hello!');
      console.log('✅ Chat working!');
      console.log('Response:', response.substring(0, 100) + '...');
    } catch (error) {
      console.error('❌ Chat failed:', error.message);
    }
  }
}

test();
```

Run it:
```bash
node test-setup.js
```

### Step 6: Choose Integration Method

**Option A: Minimal Changes (Recommended for Testing)**

Update `src/main.js` to use the multi-API manager:

```javascript
// Add at the top of src/main.js
require('dotenv').config();
const { getAPIManager } = require('./multi-api-manager');

// Initialize in app.whenReady()
let apiManager;
app.whenReady().then(() => {
  apiManager = getAPIManager();
  console.log('API Manager initialized with providers:',
    apiManager.getAvailableProviders());
  createWindow();
});

// Update generateAIResponse function
async function generateAIResponse(message) {
  try {
    return await apiManager.chat(message);
  } catch (error) {
    console.error('API Error:', error);
    return `Error: ${error.message}. Please check your API configuration.`;
  }
}
```

**Option B: Full Integration (Recommended for Production)**

```bash
# Backup original
cp src/main.js src/main.backup.js

# Use the API-integrated version
cp src/main-with-api.js src/main.js
```

Then update `src/main.js` to use `multi-api-manager.js` instead of `api-service.js`.

---

## 🎯 Using Multiple APIs

### Switch Between AI Providers

In your renderer process or via IPC:

```javascript
// Set active provider
apiManager.setProvider('anthropic');  // Use Claude
apiManager.setProvider('openai');     // Use GPT-4
apiManager.setProvider('openrouter'); // Use Open Router

// Get active provider
console.log('Current provider:', apiManager.getActiveProvider());

// Chat with specific provider
const response = await apiManager.chat('Hello', [], {
  provider: 'anthropic'
});
```

### Use Different Services

```javascript
// Search
const searchResults = await apiManager.search('JavaScript tutorials');

// Text to Speech
const audio = await apiManager.textToSpeech('Hello world');

// Generate Image
const image = await apiManager.generateImage('A beautiful sunset');

// Store Memory
await apiManager.storeMemory({
  user_id: 'user123',
  content: 'User prefers dark mode'
});

// GitHub Operations
const repos = await apiManager.githubOperation('/user/repos');
```

---

## 📝 Configuration Tips

### Required Keys (Pick At Least One AI Provider)

**Minimum setup for chat:**
- `ANTHROPIC_API_KEY` **OR**
- `OPENAI_API_KEY` **OR**
- `OPEN_ROUTER_API_KEY`

### Recommended Configuration

```env
# Primary AI (choose one)
ANTHROPIC_API_KEY=your_key
DEFAULT_AI_PROVIDER=anthropic

# Backup AI (optional)
OPEN_ROUTER_API_KEY=your_key

# Search (optional but useful)
SERPAPI_API_KEY=your_key

# Database (optional)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

### Optional Enhancements

Add any of these for extended functionality:
- **Text-to-Speech**: `ELEVEN_LABS_API_KEY`
- **Image Generation**: `STABLE_DIFFUSION_KEY`
- **Memory**: `MEM0_API_KEY`
- **GitHub Integration**: `GITHUB_TOKEN`
- **Vector DB**: `QUADRANT_API_KEY`

---

## 🔧 Troubleshooting

### "Provider not initialized"

**Cause**: API key not in `.env` file

**Fix**:
1. Open `.env`
2. Add the API key for that provider
3. Restart the app

### "Invalid API key"

**Cause**: Wrong key or expired key

**Fix**:
1. Verify key is correct (check for spaces/typos)
2. Regenerate key from provider dashboard
3. Update `.env`

### "No providers available"

**Cause**: No API keys configured

**Fix**:
1. Add at least one AI provider key to `.env`
2. Restart the app

### "Module not found: dotenv"

**Fix**:
```bash
npm install dotenv
```

---

## 🎨 UI Integration (Optional)

Want users to switch AI providers from the UI?

Add to `src/renderer.js`:

```javascript
// Add provider selector to HTML
const providerSelect = document.createElement('select');
providerSelect.id = 'providerSelect';

// Populate with available providers
const providers = await window.electronAPI.getProviders();
providers.forEach(provider => {
  const option = document.createElement('option');
  option.value = provider;
  option.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
  providerSelect.appendChild(option);
});

// Handle provider change
providerSelect.addEventListener('change', async (e) => {
  await window.electronAPI.setProvider(e.target.value);
});
```

Add to `src/preload.js`:

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing methods ...
  getProviders: () => ipcRenderer.invoke('get-providers'),
  setProvider: (provider) => ipcRenderer.invoke('set-provider', provider),
  getActiveProvider: () => ipcRenderer.invoke('get-active-provider')
});
```

Add to `src/main.js`:

```javascript
ipcMain.handle('get-providers', () => {
  return apiManager.getAvailableProviders();
});

ipcMain.handle('set-provider', (event, provider) => {
  return apiManager.setProvider(provider);
});

ipcMain.handle('get-active-provider', () => {
  return apiManager.getActiveProvider();
});
```

---

## 🚀 Ready to Launch!

Once your `.env` is configured:

```bash
# Development mode
npm run dev

# Production build
npm run build

# Run the app
npm start
```

---

## 📚 Next Steps

1. ✅ Secure your API keys in `.env`
2. ✅ Test with `node test-setup.js`
3. ✅ Run the app with `npm start`
4. 📖 Read `API_INTEGRATION_GUIDE.md` for advanced usage
5. 🎨 Customize the UI for your needs
6. 🚢 Build standalone executables with `npm run build`

---

## 🆘 Need Help?

- Check `API_INTEGRATION_GUIDE.md` for detailed examples
- Review `.env.example` for all available options
- Open an issue on GitHub for support

---

**Remember**: Your `.env` file contains sensitive data. NEVER commit it to version control!
