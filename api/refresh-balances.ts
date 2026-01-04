import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const TRADELOCKER_API_KEY = process.env.TRADELOCKER_API_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Decrypt password (must match frontend encryption)
function decryptPassword(encrypted: string): string {
  try {
    const decoded = Buffer.from(encrypted, 'base64').toString('binary');
    return decoded
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)))
      .join('');
  } catch {
    return '';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Admin authentication - check for admin key or Vercel cron authorization
  const adminKey = req.headers['x-admin-key'];
  const cronAuth = req.headers['authorization'];
  const isVercelCron = cronAuth === `Bearer ${process.env.CRON_SECRET}`;
  
  if (adminKey !== process.env.ADMIN_API_KEY && !isVercelCron) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Log job start
  const { data: logEntry } = await supabase
    .from('cron_logs')
    .insert({
      job_name: 'refresh-balances',
      status: 'started',
      details: { triggered_by: isVercelCron ? 'cron' : 'admin' }
    })
    .select()
    .single();

  try {
    // Fetch all active trading accounts with stored credentials
    const { data: accounts, error: fetchError } = await supabase
      .from('trading_accounts')
      .select('*')
      .eq('is_active', true)
      .not('tl_password_encrypted', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    if (!accounts || accounts.length === 0) {
      return res.status(200).json({ message: 'No accounts to refresh', updated: 0 });
    }

    // Group accounts by email/server combination
    const credentialGroups: Record<string, typeof accounts> = {};
    for (const account of accounts) {
      const key = `${account.tl_email}|${account.tl_server}`;
      if (!credentialGroups[key]) {
        credentialGroups[key] = [];
      }
      credentialGroups[key].push(account);
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Process each credential group
    for (const [key, groupAccounts] of Object.entries(credentialGroups)) {
      const [email, server] = key.split('|');
      const password = decryptPassword(groupAccounts[0].tl_password_encrypted);

      if (!password) {
        errors.push(`Failed to decrypt password for ${email}`);
        continue;
      }

      try {
        // Authenticate with TradeLocker
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
          errors.push(`Auth failed for ${email}`);
          continue;
        }

        // Fetch accounts from TradeLocker
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
          errors.push(`Failed to fetch accounts for ${email}`);
          continue;
        }

        // Update each account's balance (skip if balance_override is true)
        for (const dbAccount of groupAccounts) {
          // Skip accounts with admin override
          if (dbAccount.balance_override) {
            continue;
          }

          const tlAccount = (accountsData.accounts || []).find(
            (a: any) => 
              a.id?.toString() === dbAccount.account_number || 
              a.accNum?.toString() === dbAccount.account_number
          );

          if (tlAccount) {
            const newBalance = parseFloat(tlAccount.accountBalance) || 0;
            const { error: updateError } = await supabase
              .from('trading_accounts')
              .update({
                current_balance: newBalance,
                last_updated: new Date().toISOString()
              })
              .eq('id', dbAccount.id);

            if (!updateError) {
              updatedCount++;
            }
          }
        }
      } catch (err: any) {
        errors.push(`Error processing ${email}: ${err.message}`);
      }
    }

    // Log job completion
    if (logEntry?.id) {
      await supabase
        .from('cron_logs')
        .update({
          status: 'completed',
          accounts_updated: updatedCount,
          accounts_total: accounts.length,
          errors: errors.length > 0 ? errors : null,
          details: { triggered_by: isVercelCron ? 'cron' : 'admin', duration_ms: Date.now() - new Date(logEntry.created_at).getTime() }
        })
        .eq('id', logEntry.id);
    }

    return res.status(200).json({
      message: 'Balance refresh completed',
      updated: updatedCount,
      total: accounts.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Refresh balances error:', error);
    
    // Log job failure
    if (logEntry?.id) {
      await supabase
        .from('cron_logs')
        .update({
          status: 'failed',
          errors: [error.message],
          details: { triggered_by: isVercelCron ? 'cron' : 'admin', error: error.message }
        })
        .eq('id', logEntry.id);
    }

    return res.status(500).json({ error: 'Failed to refresh balances', details: error.message });
  }
}
