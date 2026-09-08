# 🎤 Voice Mode Setup

## Quick Setup (No Server Required!)

Voice mode now uses your Deepgram API key directly from the browser. No serverless functions needed!

### Step 1: Get Your Deepgram API Key

1. Go to [Deepgram Console](https://console.deepgram.com/)
2. Sign up (you get **$200 free credit**)
3. Click **API Keys** → **Create API Key**
4. Copy your key

### Step 2: Add API Key in the App

1. Open your deployed app
2. Go to **Profile** (bottom navigation)
3. Scroll to **Voice Mode Settings**
4. Paste your Deepgram API key
5. Click **Save API Key**
6. ✅ Done!

### Step 3: Test Voice Mode

1. Go to **Home** page
2. Click the 🎤 **Voice Mode** button
3. You'll hear: *"Hello! I'm your AI astrologer..."*
4. Click the microphone button
5. Grant microphone permission
6. Speak your question
7. Get AI response!

---

## How It Works

```
User enters API key in Profile settings
    ↓
Key saved to browser localStorage
    ↓
User clicks Voice Mode
    ↓
Greeting plays automatically
    ↓
User clicks microphone
    ↓
App uses stored API key
    ↓
Connects to Deepgram WebSocket
    ↓
Audio streams to Deepgram
    ↓
Transcription received
    ↓
AI generates response
    ↓
Response spoken back
```

---

## Features

✅ **No server needed** - API key stored in browser  
✅ **Secure** - Key only in your browser, not shared  
✅ **Free** - $200 credit from Deepgram  
✅ **Real-time** - Live transcription as you speak  
✅ **AI-powered** - Responses based on your birth chart  
✅ **Voice output** - AI speaks responses back  

---

## Troubleshooting

### "Deepgram API key not configured"
- Go to Profile settings
- Add your API key
- Click Save

### "Microphone access denied"
- Allow microphone permissions in browser
- Check browser settings → Site permissions

### No audio response
- Check browser/system volume
- Try Chrome or Edge (best support)
- Click page first (some browsers block auto-play)

### "Failed to initialize voice service"
- Check API key is correct
- Verify Deepgram account is active
- Try regenerating API key

---

## Privacy

- Your API key is stored **only in your browser** (localStorage)
- Never sent to any server except Deepgram
- Cleared when you clear browser data
- Each user needs their own key

---

## Cost

- **$200 free credit** on signup
- After that: ~$0.0043/minute for Nova-2
- Very affordable for personal use!

---

## Tips

1. **Speak clearly** - Deepgram is accurate but clear speech helps
2. **Short questions work best** - "What about my career?" vs long paragraphs
3. **Wait for response** - Don't speak while AI is talking
4. **Use natural language** - Ask like you're talking to a friend

---

**Status**: ✅ Ready to use  
**Last Updated**: 2026-01-28
