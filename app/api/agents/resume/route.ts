/**
 * Resume Generation API
 * =====================
 * POST /api/agents/resume - Generate resume + cover letter for a job
 * PUT  /api/agents/resume - Update a resume variant (HITL edit)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertResume } from "@/lib/supabase/queries";
import { writerAgent } from "@/lib/agents/writer";
import { mockUser } from "@/data/mock-user";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, jobTitle, jobCompany, jobDescription, jobSkills } = body;

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { success: false, error: "jobTitle and jobDescription are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Build agent state for the writer
    const userProfile = {
      id: user?.id || "demo-user",
      email: user?.email || mockUser.email,
      name: mockUser.name,
      skills: mockUser.skills.map((s) => ({ name: s.name, level: s.level })),
      experience: mockUser.experience.map((e) => ({
        company: e.company,
        title: e.title,
        startDate: "2022",
        description: e.description,
        skillsUsed: e.skills,
      })),
      preferences: {
        targetRoles: [mockUser.title],
        workMode: mockUser.preferences.workMode,
        locations: mockUser.preferences.locations,
      },
      careerGoal3yr: mockUser.careerGoal,
    };

    const targetJob = {
      id: jobId || `gen-${Date.now()}`,
      title: jobTitle,
      company: jobCompany || "Company",
      location: "",
      description: jobDescription,
      url: "",
      source: "manual",
      postedAt: new Date().toISOString(),
      isFresh: true,
      isRemote: false,
      extractedSkills: jobSkills || [],
      scores: {
        skills: 85,
        culture: 80,
        trajectory: 82,
        composite: 83,
      },
    };

    // Run writer agent
    const agentState = {
      user: userProfile,
      discoveredJobs: [],
      scoredJobs: [targetJob],
      generatedResumes: [],
      interviewPrep: undefined,
      events: [],
      currentAgent: "writer" as const,
    };

    const result = await writerAgent(agentState);
    const generated = result.generatedResumes?.[0];

    if (!generated) {
      return NextResponse.json(
        { success: false, error: "Writer agent failed to generate resume" },
        { status: 500 }
      );
    }

    // Save to Supabase if authenticated
    const resumeRecord = {
      job_id: jobId || null,
      framing_strategy: generated.framingStrategy || "general",
      content: generated.resumeMarkdown || generated.content || "",
      cover_letter: generated.coverLetter || "",
      status: "draft",
    };

    if (user) {
      const saved = await upsertResume(supabase, user.id, resumeRecord);
      return NextResponse.json({
        success: true,
        data: {
          id: saved?.id || `r-${Date.now()}`,
          ...resumeRecord,
          jobTitle,
          jobCompany,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `r-${Date.now()}`,
        ...resumeRecord,
        jobTitle,
        jobCompany,
      },
    });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, coverLetter, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Resume id is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updates: Record<string, unknown> = { id };
    if (content !== undefined) updates.content = content;
    if (coverLetter !== undefined) updates.cover_letter = coverLetter;
    if (status !== undefined) updates.status = status;

    if (user) {
      const saved = await upsertResume(supabase, user.id, updates);
      return NextResponse.json({ success: true, data: saved });
    }

    return NextResponse.json({ success: true, data: { ...updates } });
  } catch (error) {
    console.error("Resume update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
