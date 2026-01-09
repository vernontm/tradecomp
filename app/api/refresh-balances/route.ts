import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/encryption";

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
  const supabase = getSupabaseAdmin();
  const errors: string[] = [];
  let logId: string | null = null;

  try {
    const adminApiKey = request.headers.get("x-admin-api-key");
    const cronSecret = request.headers.get("authorization")?.replace("Bearer ", "");

    const isAuthorized =
      adminApiKey === process.env.ADMIN_API_KEY ||
      cronSecret === process.env.CRON_SECRET;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: accounts, error } = await supabase
      .from("trading_accounts")
      .select("*")
      .eq("is_active", true)
      .eq("balance_override", false);

    if (error) throw error;

    // Create cron log entry
    const { data: logData } = await supabase
      .from("cron_logs")
      .insert({
        job_name: "refresh-balances",
        status: "started",
        accounts_total: accounts?.length || 0,
        accounts_updated: 0,
      })
      .select("id")
      .single();

    logId = logData?.id;

    let updated = 0;
    let failed = 0;

    for (const account of accounts || []) {
      try {
        // Skip accounts without stored credentials
        if (!account.tl_email || !account.tl_server || !account.tl_password_encrypted) {
          errors.push(`Account ${account.account_number}: Missing credentials`);
          failed++;
          continue;
        }

        // Decrypt the password
        let password: string;
        try {
          password = decrypt(account.tl_password_encrypted);
        } catch (decryptError) {
          errors.push(`Account ${account.account_number}: Failed to decrypt password`);
          failed++;
          continue;
        }

        const accessToken = await authenticateTradeLocker(
          account.tl_email,
          password,
          account.tl_server
        );

        if (!accessToken) {
          errors.push(`Account ${account.account_number}: Authentication failed`);
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
          errors.push(`Account ${account.account_number}: Failed to fetch balance`);
          failed++;
        }
      } catch (accountError: any) {
        errors.push(`Account ${account.account_number}: ${accountError.message || "Unknown error"}`);
        failed++;
      }
    }

    // Update cron log with results
    if (logId) {
      await supabase
        .from("cron_logs")
        .update({
          status: failed === 0 ? "completed" : "completed",
          accounts_updated: updated,
          errors: errors.length > 0 ? errors : null,
        })
        .eq("id", logId);
    }

    return NextResponse.json({
      success: true,
      updated,
      failed,
      total: accounts?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Refresh balances error:", error);

    // Update cron log with failure
    if (logId) {
      await supabase
        .from("cron_logs")
        .update({
          status: "failed",
          errors: [error.message || "Unknown error"],
        })
        .eq("id", logId);
    }

    return NextResponse.json(
      { error: "Failed to refresh balances", details: error.message },
      { status: 500 }
    );
  }
}
