export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from environment variables
    const apiKey = process.env.DEEPGRAM_API_KEY;

    // Check if API key is configured
    if (!apiKey) {
      console.error('DEEPGRAM_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'Deepgram API key not configured. Please add DEEPGRAM_API_KEY to your Vercel environment variables.' 
      });
    }

    // Return the API key
    return res.status(200).json({ 
      key: apiKey 
    });
  } catch (error) {
    console.error('Error in deepgram-key API:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
