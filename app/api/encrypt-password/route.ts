import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const encrypted = encrypt(password);

    return NextResponse.json({ encrypted });
  } catch (error: any) {
    console.error("Encryption error:", error);
    return NextResponse.json(
      { error: "Failed to encrypt password" },
      { status: 500 }
    );
  }
}
