import { NextResponse } from "next/server";
import { mockResumes } from "@/data/mock-resumes";

export async function GET() {
  return NextResponse.json({ success: true, data: mockResumes });
}
