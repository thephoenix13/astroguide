module.exports = (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    console.error('DEEPGRAM_API_KEY is not set');
    return res.status(500).json({ 
      error: 'Deepgram API key not configured. Add DEEPGRAM_API_KEY to your environment variables.' 
    });
  }

  return res.status(200).json({ key: apiKey });
};
