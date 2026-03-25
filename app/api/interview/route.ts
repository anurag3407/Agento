import { NextResponse } from "next/server";
import { mockSessions } from "@/data/mock-interviews";

export async function GET() {
  return NextResponse.json({ success: true, data: mockSessions });
}

export async function POST(request: Request) {
  // Stub: save a completed interview session
  const body = await request.json();
  return NextResponse.json({ success: true, sessionId: `s${Date.now()}` });
}
