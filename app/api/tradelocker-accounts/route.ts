import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const accountType = request.headers.get("x-account-type") || "live";
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");
    const TRADELOCKER_API_KEY = process.env.TRADELOCKER_API_KEY;
    
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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const accounts = data.accounts || [];
    // id = 6-digit account number (850196) - store this as account_number
    // accNum = small index (3, 4) - internal TradeLocker index
    const formattedAccounts = accounts.map((account: any) => ({
      accountId: account.id?.toString() || "",
      accNum: account.accNum?.toString() || "",
      displayNumber: account.id?.toString() || "",
      name:
        account.name ||
        account.accountName ||
        `Account ${account.id || account.accNum}`,
      balance: parseFloat(account.accountBalance) || account.balance || 0,
      equity: parseFloat(account.equity) || 0,
      margin: parseFloat(account.margin) || 0,
      freeMargin: parseFloat(account.freeMargin) || 0,
      profit: parseFloat(account.profit) || 0,
      currency: account.currency || "USD",
    }));

    return NextResponse.json({ accounts: formattedAccounts });
  } catch (error: any) {
    console.error("TradeLocker accounts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts", details: error.message },
      { status: 500 }
    );
  }
}
