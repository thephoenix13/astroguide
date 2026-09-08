# 🚀 Setting Up Deepgram Voice Agent

## Step 1: Get Your Deepgram API Key

1. Go to [Deepgram Console](https://console.deepgram.com/)
2. Sign up / Log in
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key

## Step 2: Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `DEEPGRAM_API_KEY`
   - **Value:** Your Deepgram API key
   - **Environment:** Production, Preview, Development (all)
4. Click **Save**

## Step 3: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete

## Step 4: Test

1. Open your deployed app
2. Click the **Voice Mode** button on Home page
3. Grant microphone permission when prompted
4. Speak your question
5. The AI will respond with voice!

## Local Development

For local testing, create a `.env.local` file:

```bash
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

Then run:
```bash
npm run dev
```

## Troubleshooting

### "Failed to initialize voice service"
- Check that `DEEPGRAM_API_KEY` is set in Vercel environment variables
- Redeploy after adding the variable
- Check Vercel function logs for errors

### "Microphone access denied"
- Allow microphone permissions in your browser
- Check browser settings → Site permissions

### No audio response
- Check browser volume
- Try a different browser (Chrome/Edge work best)

## Security Note

The current implementation uses a simple serverless function to expose the API key. For production, consider:
- Adding authentication to the `/api/deepgram-key` endpoint
- Using Deepgram's temporary token feature
- Implementing rate limiting

## Deepgram Features Used

- **Nova-2 Model**: Latest and most accurate model
- **Smart Format**: Automatic punctuation and formatting
- **Interim Results**: Real-time transcription as you speak
- **Endpointing**: Detects when you stop speaking
- **Utterance End**: Processes complete sentences

## Pricing

Deepgram offers:
- **$200 free credit** on signup
- **Pay-as-you-go** after that (~$0.0043/minute for Nova-2)
- Very affordable for personal use!
