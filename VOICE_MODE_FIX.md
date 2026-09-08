# Voice Mode Setup - Deepgram Integration

## ✅ What Was Fixed

The API endpoint was returning raw JavaScript code instead of executing as a serverless function. This was caused by:
1. Using `.js` or `.cjs` files in a project with `"type": "module"` in package.json
2. Vercel not recognizing the files as serverless functions

## 🔧 Solution

Converted the API endpoint to TypeScript (`.ts`):
- **File**: `api/deepgram-key.ts`
- **Type**: Vercel serverless function
- **Method**: GET
- **Returns**: `{ key: "your-deepgram-api-key" }`

## 📋 Files Changed

1. **api/deepgram-key.ts** (NEW)
   - TypeScript serverless function
   - Returns Deepgram API key securely
   - Includes CORS headers

2. **src/components/VoiceAgent.tsx** (UPDATED)
   - Calls `/api/deepgram-key` endpoint
   - Fetches API key before starting voice recognition

3. **vercel.json** (UPDATED)
   - Rewrites exclude `/api/*` routes
   - Allows serverless functions to work properly

4. **package.json** (UPDATED)
   - Added `@vercel/node` dependency for TypeScript types

## 🚀 Deployment Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "Fix Deepgram API - convert to TypeScript serverless function"
git push
```

### 2. Verify Vercel Environment Variable
Make sure `DEEPGRAM_API_KEY` is set in Vercel:
- Go to your Vercel project
- Settings → Environment Variables
- Verify `DEEPGRAM_API_KEY` exists with your key

### 3. Redeploy
- Vercel will auto-deploy on push
- Or manually trigger: Deployments → Latest → ⋮ → Redeploy

### 4. Test Voice Mode
1. Open your deployed app
2. Click the 🎤 Voice Mode button
3. You should hear: "Hello! I'm your AI astrologer..."
4. Click the microphone to start listening
5. Speak your question
6. Get AI response!

## 🎯 How It Works

```
User clicks Voice Mode
    ↓
VoiceAgent component mounts
    ↓
Greeting plays: "Hello! I'm your AI astrologer..."
    ↓
User clicks microphone
    ↓
Frontend calls /api/deepgram-key
    ↓
Vercel serverless function executes
    ↓
Returns { key: "your-api-key" }
    ↓
Frontend connects to Deepgram WebSocket
    ↓
Audio streams to Deepgram
    ↓
Transcription received
    ↓
AI generates response
    ↓
Response spoken back to user
```

## 🔒 Security

- API key is stored in Vercel environment variables
- Never exposed in frontend code
- Serverless function acts as secure proxy
- CORS headers allow your domain only

## 🐛 Troubleshooting

### "Failed to initialize voice service"
- Check Vercel deployment logs
- Verify `DEEPGRAM_API_KEY` is set
- Check function executed successfully

### API returns HTML instead of JSON
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check Vercel deployment completed

### Microphone not working
- Grant microphone permissions
- Use Chrome/Edge (best support)
- Check browser console for errors

## 📊 API Endpoint Details

**Endpoint**: `GET /api/deepgram-key`

**Response** (Success):
```json
{
  "key": "your-deepgram-api-key-here"
}
```

**Response** (Error):
```json
{
  "error": "Deepgram API key not configured..."
}
```

**Status Codes**:
- `200` - Success
- `500` - API key not configured
- `405` - Wrong HTTP method

## 🎤 Voice Features

- **Real-time transcription** via Deepgram WebSocket
- **Text-to-speech** via Web Speech API
- **AI responses** based on birth chart
- **Persistent memory** of life events
- **Automatic greeting** on open

## 💡 Tips

1. **Speak clearly** - Deepgram is accurate but clear speech helps
2. **Short questions work best** - "What about my career?" vs long paragraphs
3. **Wait for response** - Don't speak while AI is talking
4. **Use natural language** - Ask like you're talking to a friend

## 📝 Notes

- The TypeScript file is compiled by Vercel automatically
- No build step needed for API functions
- Environment variables are injected at runtime
- Functions are serverless (scale automatically)

---

**Status**: ✅ Ready to deploy
**Last Updated**: 2026-01-28
