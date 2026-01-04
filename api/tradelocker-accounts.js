import axios from 'axios';

const TRADELOCKER_LIVE_URL = 'https://live.tradelocker.com';
const TRADELOCKER_API_KEY = process.env.TRADELOCKER_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const accessToken = authorization.replace('Bearer ', '');

  try {
    const response = await axios.get(
      `${TRADELOCKER_LIVE_URL}/auth/jwt/all-accounts`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TRADELOCKER_API_KEY || '',
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('TradeLocker accounts error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to fetch accounts'
    });
  }
}
