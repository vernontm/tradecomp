const axios = require('axios');

const TRADELOCKER_LIVE_URL = 'https://live.tradelocker.com';
const TRADELOCKER_API_KEY = process.env.VITE_TRADELOCKER_API_KEY;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, server } = req.body;

  if (!email || !password || !server) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await axios.post(
      `${TRADELOCKER_LIVE_URL}/auth/jwt/token`,
      { email, password, server },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TRADELOCKER_API_KEY || ''
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('TradeLocker auth error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Authentication failed'
    });
  }
};
