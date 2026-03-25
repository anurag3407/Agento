import { NextResponse } from "next/server";
import { mockUser } from "@/data/mock-user";

export async function GET() {
  return NextResponse.json({ success: true, data: mockUser });
}
