import type { VercelRequest, VercelResponse } from '@vercel/node';

const TRADELOCKER_API_KEY = process.env.TRADELOCKER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, server, accountIds } = req.body;

  if (!email || !password || !server) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // First authenticate
    const authResponse = await fetch('https://live.tradelocker.com/backend-api/auth/jwt/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TRADELOCKER_API_KEY || ''
      },
      body: JSON.stringify({ email, password, server })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.accessToken) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Then fetch accounts
    const accountsResponse = await fetch('https://live.tradelocker.com/backend-api/auth/jwt/all-accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TRADELOCKER_API_KEY || '',
        'Authorization': `Bearer ${authData.accessToken}`
      }
    });

    const accountsData = await accountsResponse.json();

    if (!accountsResponse.ok) {
      return res.status(accountsResponse.status).json(accountsData);
    }

    // Map accounts with balances
    const accounts = (accountsData.accounts || []).map((account: any) => ({
      id: account.id?.toString() || '',
      accNum: account.accNum?.toString() || '',
      name: account.name || '',
      balance: parseFloat(account.accountBalance) || 0,
      currency: account.currency || 'USD',
      status: account.status
    }));

    // Filter to only requested account IDs if provided
    const filteredAccounts = accountIds 
      ? accounts.filter((acc: any) => accountIds.includes(acc.id) || accountIds.includes(acc.accNum))
      : accounts;

    return res.status(200).json({ accounts: filteredAccounts });
  } catch (error: any) {
    console.error('Refresh balances error:', error);
    return res.status(500).json({ error: 'Failed to refresh balances', details: error.message });
  }
}
