import { NextResponse } from "next/server";
import { mockApplications } from "@/data/mock-applications";

export async function GET() {
  // Stub: return mock applications
  return NextResponse.json({ success: true, data: mockApplications });
}
