import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const accessToken = authorization.replace('Bearer ', '');
  const TRADELOCKER_API_KEY = process.env.TRADELOCKER_API_KEY;

  try {
    const response = await fetch('https://live.tradelocker.com/backend-api/auth/jwt/all-accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TRADELOCKER_API_KEY || '',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('TradeLocker accounts error:', error);
    return res.status(500).json({ error: 'Failed to fetch accounts', details: error.message });
  }
}
