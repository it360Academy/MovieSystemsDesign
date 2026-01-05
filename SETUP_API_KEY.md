# How to Set OpenAI API Key

## Quick Fix

1. **Set the API key in your current PowerShell session:**
   ```powershell
   $env:OPENAI_API_KEY="your_api_key_here"
   ```

2. **Restart the server:**
   ```powershell
   npm run kill:port
   npm start
   ```

3. **Verify the API key is detected:**
   - Check the server console output - it should show: "OpenAI API key detected (length: XXX). LLM features enabled."

## Permanent Setup

### Option 1: PowerShell Profile (Recommended)
Add to your PowerShell profile (`$PROFILE`):
```powershell
$env:OPENAI_API_KEY="your_api_key_here"
```

### Option 2: Create .env file
Create a `.env` file in the project root:
```
OPENAI_API_KEY=your_api_key_here
```

### Option 3: System Environment Variables
Set it as a system environment variable in Windows Settings.

## Verify Your API Key

1. Make sure your API key starts with `sk-`
2. Get a valid key from: https://platform.openai.com/api-keys
3. Ensure the key hasn't been revoked or expired

## Troubleshooting

- **"Invalid API key" error**: Your API key might be expired, revoked, or incorrect. Get a new one from OpenAI.
- **"API key not set"**: Make sure you set it before starting the server, or use a `.env` file.
- **Server not detecting key**: Restart the server after setting the environment variable.

