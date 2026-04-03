import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResumes, upsertResume } from "@/lib/supabase/queries";
import { mockResumes } from "@/data/mock-resumes";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const resumes = await getResumes(supabase, user.id);
      if (resumes.length > 0) {
        const transformed = resumes.map((r: any) => ({
          id: r.id,
          jobId: r.job_id,
          jobTitle: r.jobs?.title || "",
          jobCompany: r.jobs?.company || "",
          framingStrategy: r.framing_strategy,
          content: r.content,
          coverLetter: r.cover_letter,
          status: r.status,
          callbackCount: r.callback_count,
          totalSent: r.total_sent,
          createdAt: r.created_at,
        }));
        return NextResponse.json({ success: true, data: transformed });
      }
    }

    return NextResponse.json({ success: true, data: mockResumes });
  } catch (error) {
    console.error("Resumes GET error:", error);
    return NextResponse.json({ success: true, data: mockResumes });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Resume id required" },
        { status: 400 }
      );
    }

    if (user) {
      const updates: Record<string, unknown> = { id: body.id };
      if (body.content !== undefined) updates.content = body.content;
      if (body.coverLetter !== undefined) updates.cover_letter = body.coverLetter;
      if (body.status !== undefined) updates.status = body.status;

      const saved = await upsertResume(supabase, user.id, updates);
      return NextResponse.json({ success: true, data: saved });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Resumes PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update resume" },
      { status: 500 }
    );
  }
}
