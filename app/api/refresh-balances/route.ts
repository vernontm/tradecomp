import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

const TRADELOCKER_API_KEY = process.env.TRADELOCKER_API_KEY;

async function authenticateTradeLocker(
  email: string,
  password: string,
  server: string
): Promise<string | null> {
  try {
    const response = await fetch(
      "https://live.tradelocker.com/backend-api/auth/jwt/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TRADELOCKER_API_KEY || "",
        },
        body: JSON.stringify({ email, password, server }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.accessToken || null;
  } catch {
    return null;
  }
}

async function getAccountBalance(
  accessToken: string,
  accountId: string
): Promise<number | null> {
  try {
    const response = await fetch(
      "https://live.tradelocker.com/backend-api/auth/jwt/all-accounts",
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TRADELOCKER_API_KEY || "",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const account = data.accounts?.find(
      (acc: any) => acc.id?.toString() === accountId
    );
    return account ? parseFloat(account.accountBalance) || account.balance : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminApiKey = request.headers.get("x-admin-api-key");
    const cronSecret = request.headers.get("authorization")?.replace("Bearer ", "");

    const isAuthorized =
      adminApiKey === process.env.ADMIN_API_KEY ||
      cronSecret === process.env.CRON_SECRET;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    const { data: accounts, error } = await supabase
      .from("trading_accounts")
      .select("*")
      .eq("is_active", true)
      .eq("balance_override", false);

    if (error) throw error;

    let updated = 0;
    let failed = 0;

    for (const account of accounts || []) {
      try {
        // Note: In production, you'd need to decrypt the password
        // For now, we'll skip accounts without stored credentials
        if (!account.tl_email || !account.tl_server) {
          continue;
        }

        // This is a simplified version - in production you'd need proper credential handling
        const accessToken = await authenticateTradeLocker(
          account.tl_email,
          "", // Password would need to be decrypted
          account.tl_server
        );

        if (!accessToken) {
          failed++;
          continue;
        }

        const balance = await getAccountBalance(accessToken, account.account_number);

        if (balance !== null) {
          await supabase
            .from("trading_accounts")
            .update({
              current_balance: balance,
              last_updated: new Date().toISOString(),
            })
            .eq("id", account.id);
          updated++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      failed,
      total: accounts?.length || 0,
    });
  } catch (error: any) {
    console.error("Refresh balances error:", error);
    return NextResponse.json(
      { error: "Failed to refresh balances", details: error.message },
      { status: 500 }
    );
  }
}
