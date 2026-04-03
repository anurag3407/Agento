import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getJobs, upsertJobs } from "@/lib/supabase/queries";
import { mockJobs } from "@/data/mock-jobs";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const jobs = await getJobs(supabase, user.id);
      if (jobs.length > 0) {
        // Transform DB format to frontend format
        const transformed = jobs.map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          salary: j.salary,
          description: j.description,
          source: j.source,
          sourceUrl: j.url,
          postedAt: j.posted_at,
          discoveredAt: j.discovered_at,
          isFresh: j.is_fresh,
          isRemote: j.is_remote,
          requiredSkills: j.extracted_skills || [],
          scores: j.scores,
          hiddenRequirements: j.hidden_requirements || [],
          aiReasoning: j.ai_reasoning,
        }));
        return NextResponse.json({ success: true, count: transformed.length, data: transformed });
      }
    }

    // Fallback to mock data
    return NextResponse.json({ success: true, count: mockJobs.length, data: mockJobs });
  } catch (error) {
    console.error("Jobs GET error:", error);
    return NextResponse.json({ success: true, count: mockJobs.length, data: mockJobs });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await request.json();

    if (user && body.jobs?.length) {
      const dbJobs = body.jobs.map((j: any) => ({
        id: j.id || `j-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: j.title,
        company: j.company,
        location: j.location,
        salary: j.salary,
        description: j.description,
        url: j.sourceUrl || j.url,
        source: j.source,
        posted_at: j.postedAt,
        is_fresh: j.isFresh,
        is_remote: j.isRemote,
        extracted_skills: j.requiredSkills || j.extractedSkills || [],
        scores: j.scores,
        hidden_requirements: j.hiddenRequirements || [],
        ai_reasoning: j.aiReasoning,
      }));
      const saved = await upsertJobs(supabase, user.id, dbJobs);
      return NextResponse.json({ success: true, data: saved });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Jobs POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save jobs" },
      { status: 500 }
    );
  }
}
