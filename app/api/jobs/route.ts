import { NextResponse } from "next/server";
import { mockJobs } from "@/data/mock-jobs";

export async function GET() {
  // Stub: return mock jobs (replace with Supabase query later)
  return NextResponse.json({ success: true, count: mockJobs.length, data: mockJobs });
}

export async function POST(request: Request) {
  // Stub: Add a new parsed job
  const body = await request.json();
  return NextResponse.json({ success: true, data: { ...body, id: `j${Date.now()}` } });
}
