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

export async function POST(request: NextRequest) {
  try {
    const adminApiKey = request.headers.get("x-admin-api-key");

    if (adminApiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    // Get all accounts
    const { data: allAccounts, error: allError } = await supabase
      .from("trading_accounts")
      .select("*");

    if (allError) throw allError;

    // Get accounts that would be processed by cron
    const { data: activeAccounts, error: activeError } = await supabase
      .from("trading_accounts")
      .select("*")
      .eq("is_active", true)
      .eq("balance_override", false);

    if (activeError) throw activeError;

    // Check which accounts have encrypted passwords
    const accountsWithPassword = activeAccounts?.filter(acc => acc.tl_password_encrypted) || [];
    const accountsWithoutPassword = activeAccounts?.filter(acc => !acc.tl_password_encrypted) || [];

    return NextResponse.json({
      all_accounts: allAccounts?.length || 0,
      active_accounts: activeAccounts?.length || 0,
      accounts_with_password: accountsWithPassword.length,
      accounts_without_password: accountsWithoutPassword.length,
      active_accounts_list: activeAccounts?.map(acc => ({
        id: acc.id,
        account_number: acc.account_number,
        is_active: acc.is_active,
        balance_override: acc.balance_override,
        has_encrypted_password: !!acc.tl_password_encrypted,
        tl_email: acc.tl_email,
        tl_server: acc.tl_server,
      })) || [],
    });
  } catch (error: any) {
    console.error("Debug accounts error:", error);
    return NextResponse.json(
      { error: "Failed to debug accounts", details: error.message },
      { status: 500 }
    );
  }
}
