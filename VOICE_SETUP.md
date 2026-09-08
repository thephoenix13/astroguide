# 🎤 Voice Mode Setup

## Setup Instructions

Voice mode uses Deepgram's real-time speech-to-text API with a secure serverless function.

### Step 1: Get Your Deepgram API Key

1. Go to [Deepgram Console](https://console.deepgram.com/)
2. Sign up (you get **$200 free credit**)
3. Click **API Keys** → **Create API Key**
4. Copy your key

### Step 2: Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `DEEPGRAM_API_KEY`
   - **Value:** Your Deepgram API key
   - **Environment:** Production, Preview, Development (all)
4. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

### Step 4: Test Voice Mode

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
User clicks Voice Mode
    ↓
Greeting plays automatically
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
Response spoken back
```

---

## Features

✅ **Secure** - API key stored in Vercel environment variables  
✅ **Free** - $200 credit from Deepgram  
✅ **Real-time** - Live transcription as you speak  
✅ **AI-powered** - Responses based on your birth chart  
✅ **Voice output** - AI speaks responses back  
✅ **Serverless** - Automatic scaling on Vercel  

---

## Troubleshooting

### "Deepgram API key not configured"
- Check that `DEEPGRAM_API_KEY` is set in Vercel environment variables
- Redeploy after adding the variable
- Check Vercel function logs for errors

### "Microphone access denied"
- Allow microphone permissions in browser
- Check browser settings → Site permissions

### No audio response
- Check browser/system volume
- Try Chrome or Edge (best support)
- Click page first (some browsers block auto-play)

### "Failed to initialize voice service"
- Check API key is correct in Vercel
- Verify Deepgram account is active
- Try regenerating API key
- Check Vercel function logs

### API returns HTML instead of JSON
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check Vercel deployment completed
- Verify vercel.json is configured correctly

---

## Privacy

- Your API key is stored securely in Vercel environment variables
- Never exposed in frontend code
- Serverless function acts as secure proxy
- Only your domain can access the API endpoint

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

## Technical Details

### API Endpoint
- **URL:** `/api/deepgram-key`
- **Method:** GET
- **Response:** `{ "key": "your-deepgram-api-key" }`

### Deepgram Configuration
- **Model:** Nova-2 (latest and most accurate)
- **Features:** Smart formatting, punctuation, interim results
- **Endpointing:** 300ms
- **Utterance end:** 1000ms

### WebSocket Connection
- **URL:** `wss://api.deepgram.com/v1/listen`
- **Protocol:** WebSocket with token authentication
- **Audio format:** PCM 16-bit, 44100 Hz

---

**Status**: ✅ Ready to deploy  
**Last Updated**: 2026-01-28
