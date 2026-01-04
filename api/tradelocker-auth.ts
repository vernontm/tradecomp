import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, server } = req.body;

  if (!email || !password || !server) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const TRADELOCKER_API_KEY = process.env.TRADELOCKER_API_KEY;

  try {
    const response = await fetch('https://live.tradelocker.com/backend-api/auth/jwt/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TRADELOCKER_API_KEY || ''
      },
      body: JSON.stringify({ email, password, server })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('TradeLocker auth error:', error);
    return res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
}
