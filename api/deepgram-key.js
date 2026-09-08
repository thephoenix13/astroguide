module.exports = function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Deepgram API key not configured. Add DEEPGRAM_API_KEY to your environment variables.' });
  }

  return res.status(200).json({ key: apiKey });
}
