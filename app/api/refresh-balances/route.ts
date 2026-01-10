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
  server: string,
  accountType: string = "live"
): Promise<{ accessToken: string | null; error?: string }> {
  try {
    // Use demo or live URL based on account type
    const baseUrl = accountType === "demo" 
      ? "https://demo.tradelocker.com" 
      : "https://live.tradelocker.com";
    
    const url = `${baseUrl}/backend-api/auth/jwt/token`;
    const body = { email, password, server };
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": TRADELOCKER_API_KEY || "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        accessToken: null, 
        error: `URL: ${url}, Server: ${server}, AccountType: ${accountType}, Status: ${response.status}, Response: ${JSON.stringify(data)}` 
      };
    }
    
    return { accessToken: data.accessToken || null };
  } catch (err: any) {
    return { accessToken: null, error: `Network error: ${err.message}` };
  }
}

async function getAccountBalance(
  accessToken: string,
  accountNumber: string,
  accNum: string | null,
  accountType: string = "live"
): Promise<number | null> {
  try {
    // Use demo or live URL based on account type
    const baseUrl = accountType === "demo" 
      ? "https://demo.tradelocker.com" 
      : "https://live.tradelocker.com";
      
    const response = await fetch(
      `${baseUrl}/backend-api/auth/jwt/all-accounts`,
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
      (acc: any) => acc.id?.toString() === accountNumber || acc.accNum?.toString() === accNum
    );
    return account ? parseFloat(account.accountBalance) || account.balance : null;
  } catch {
    return null;
  }
}

// GET handler for Vercel Cron (Vercel Cron uses GET requests)
export async function GET(request: NextRequest) {
  return handleRefresh(request);
}

// POST handler for manual triggers
export async function POST(request: NextRequest) {
  return handleRefresh(request);
}

async function handleRefresh(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const errors: string[] = [];
  let logId: string | null = null;

  try {
    const adminApiKey = request.headers.get("x-admin-api-key");
    const cronSecret = request.headers.get("authorization")?.replace("Bearer ", "");
    const vercelCronSecret = request.headers.get("x-vercel-cron-secret");

    const isAuthorized =
      adminApiKey === process.env.ADMIN_API_KEY ||
      cronSecret === process.env.CRON_SECRET ||
      vercelCronSecret === process.env.CRON_SECRET;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: accounts, error } = await supabase
      .from("trading_accounts")
      .select("*")
      .eq("is_active", true)
      .eq("balance_override", false)
      .not("tl_password_encrypted", "is", null);

    if (error) throw error;

    // Filter to only accounts with complete credentials
    const validAccounts = (accounts || []).filter(
      (acc) => acc.tl_email && acc.tl_server && acc.tl_password_encrypted
    );

    // Create cron log entry with count of accounts that have credentials
    const { data: logData } = await supabase
      .from("cron_logs")
      .insert({
        job_name: "refresh-balances",
        status: "started",
        accounts_total: validAccounts.length,
        accounts_updated: 0,
      })
      .select("id")
      .single();

    logId = logData?.id;

    let updated = 0;
    let failed = 0;

    for (const account of validAccounts) {
      try {

        // Decrypt the password
        let password: string;
        try {
          password = decrypt(account.tl_password_encrypted);
        } catch (decryptError: any) {
          errors.push(`Account ${account.account_number}: Failed to decrypt password - ${decryptError.message}`);
          failed++;
          continue;
        }

        const accountType = account.tl_account_type || "live";
        
        const authResult = await authenticateTradeLocker(
          account.tl_email,
          password,
          account.tl_server,
          accountType
        );

        if (!authResult.accessToken) {
          errors.push(`Auth failed for ${account.tl_email}: ${authResult.error || "Unknown error"}`);
          failed++;
          continue;
        }

        const balance = await getAccountBalance(authResult.accessToken, account.account_number, account.tl_acc_num, accountType);

        if (balance !== null) {
          const { error: updateError } = await supabase
            .from("trading_accounts")
            .update({
              current_balance: balance,
              last_updated: new Date().toISOString(),
            })
            .eq("id", account.id);
          
          if (updateError) {
            errors.push(`Account ${account.account_number}: Update failed - ${updateError.message}`);
            failed++;
          } else {
            updated++;
          }
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
      total: validAccounts.length,
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
