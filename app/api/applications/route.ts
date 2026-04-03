import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getApplications, createApplication, updateApplicationStatus } from "@/lib/supabase/queries";
import { mockApplications } from "@/data/mock-applications";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const apps = await getApplications(supabase, user.id);
      if (apps.length > 0) {
        const transformed = apps.map((a: any) => ({
          id: a.id,
          jobId: a.job_id,
          job: a.jobs ? {
            title: a.jobs.title,
            company: a.jobs.company,
            scores: a.jobs.scores,
          } : { title: "Unknown", company: "Unknown", scores: {} },
          status: a.status,
          resumeVariantId: a.resume_variant_id,
          rejectionReason: a.rejection_reason,
          notes: a.notes,
          appliedAt: a.applied_at,
          lastUpdated: a.last_updated,
        }));
        return NextResponse.json({ success: true, data: transformed });
      }
    }

    return NextResponse.json({ success: true, data: mockApplications });
  } catch (error) {
    console.error("Applications GET error:", error);
    return NextResponse.json({ success: true, data: mockApplications });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();

    if (user) {
      const app = await createApplication(supabase, user.id, {
        job_id: body.jobId,
        status: body.status || "discovered",
        notes: body.notes || null,
        applied_at: body.status === "applied" ? new Date().toISOString() : null,
      });
      return NextResponse.json({ success: true, data: app });
    }

    return NextResponse.json({
      success: true,
      data: { id: `app-${Date.now()}`, ...body },
    });
  } catch (error) {
    console.error("Applications POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create application" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Application id is required" },
        { status: 400 }
      );
    }

    if (user) {
      const extra: Record<string, unknown> = {};
      if (body.notes !== undefined) extra.notes = body.notes;
      if (body.rejectionReason !== undefined) extra.rejection_reason = body.rejectionReason;
      if (body.resumeVariantId !== undefined) extra.resume_variant_id = body.resumeVariantId;
      if (body.status === "applied") extra.applied_at = new Date().toISOString();

      const updated = await updateApplicationStatus(supabase, body.id, body.status, extra);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Applications PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}
