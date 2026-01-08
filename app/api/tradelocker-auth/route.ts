import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, server } = await request.json();

    if (!email || !password || !server) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const TRADELOCKER_API_KEY = process.env.TRADELOCKER_API_KEY;

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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("TradeLocker auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed", details: error.message },
      { status: 500 }
    );
  }
}
