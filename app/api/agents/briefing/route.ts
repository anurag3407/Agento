/**
 * Morning Briefing API
 * ====================
 * GET  /api/agents/briefing - Get today's briefing (or generate one)
 * POST /api/agents/briefing - Force regenerate today's briefing
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLatestBriefing, upsertBriefing, getJobs } from "@/lib/supabase/queries";
import { mockJobs } from "@/data/mock-jobs";
import { mockUser } from "@/data/mock-user";

export const maxDuration = 60;

async function generateBriefingContent(jobs: any[], userSkills: string[]) {
  const topJobs = jobs
    .filter((j: any) => j.scores?.composite)
    .sort((a: any, b: any) => (b.scores?.composite || 0) - (a.scores?.composite || 0))
    .slice(0, 5);

  const highMatches = topJobs.filter((j: any) => (j.scores?.composite || 0) >= 85);
  const newToday = jobs.filter((j: any) => j.isFresh || j.is_fresh);

  const marketInsights = [];
  const remoteCount = jobs.filter((j: any) => j.isRemote || j.is_remote).length;
  if (remoteCount > jobs.length * 0.5) {
    marketInsights.push(`${Math.round((remoteCount / Math.max(jobs.length, 1)) * 100)}% of positions are remote-friendly`);
  }
  const sources = [...new Set(jobs.map((j: any) => j.source).filter(Boolean))];
  if (sources.length > 0) {
    marketInsights.push(`Jobs sourced from ${sources.join(", ")}`);
  }
  marketInsights.push(`${highMatches.length} roles are 85%+ matches for your profile`);

  const actionItems = [];
  if (highMatches.length > 0) {
    actionItems.push({
      type: "apply",
      title: `Apply to ${highMatches[0]?.company || "top match"}`,
      description: `${highMatches[0]?.title || "High-match role"} scored ${highMatches[0]?.scores?.composite || 90}% match`,
      priority: "high",
    });
  }
  if (topJobs.length >= 2) {
    actionItems.push({
      type: "prepare",
      title: `Prepare materials for ${topJobs[1]?.company || "second match"}`,
      description: "Generate a tailored resume and cover letter",
      priority: "medium",
    });
  }
  actionItems.push({
    type: "review",
    title: "Review your pipeline",
    description: `You have ${jobs.length} total opportunities tracked`,
    priority: "low",
  });

  const encouragements = [
    "Every application you send is a step closer to your dream role. Keep pushing! 🔥",
    "Your skills are in demand — the right team is looking for someone exactly like you. 🚀",
    "Consistency wins. Keep refining, keep applying, keep growing. 💪",
    "The job market rewards preparation. You're already ahead by using AI to optimize. 🧠",
  ];

  return {
    summary: `Good morning! ${newToday.length > 0 ? `${newToday.length} fresh opportunities` : "No new jobs"} found today. ${highMatches.length > 0 ? `${highMatches.length} are excellent matches for your ${userSkills.slice(0, 3).join(", ")} skills.` : "Keep your profile updated for better matches."}`,
    top_matches: topJobs.slice(0, 3).map((j: any) => ({
      jobId: j.id,
      title: j.title,
      company: j.company,
      score: j.scores?.composite || 0,
      highlight: j.ai_reasoning || j.aiReasoning || "Great fit for your background",
    })),
    market_insights: marketInsights,
    action_items: actionItems,
    encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Try to get today's cached briefing from Supabase
      const existing = await getLatestBriefing(supabase, user.id);
      if (existing) {
        return NextResponse.json({ success: true, data: existing, cached: true });
      }

      // Generate fresh briefing
      const jobs = await getJobs(supabase, user.id);
      const userSkills = mockUser.skills.map((s) => s.name); // fallback
      const briefingContent = await generateBriefingContent(
        jobs.length > 0 ? jobs : mockJobs,
        userSkills
      );

      const saved = await upsertBriefing(supabase, user.id, briefingContent);
      return NextResponse.json({ success: true, data: saved || briefingContent });
    }

    // Fallback: generate from mock data
    const briefingContent = await generateBriefingContent(mockJobs, mockUser.skills.map((s) => s.name));
    return NextResponse.json({ success: true, data: { id: "mock", ...briefingContent } });
  } catch (error) {
    console.error("Briefing API error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const jobs = user ? await getJobs(supabase, user.id) : [];
    const userSkills = mockUser.skills.map((s) => s.name);
    const briefingContent = await generateBriefingContent(
      jobs.length > 0 ? jobs : mockJobs,
      userSkills
    );

    if (user) {
      const saved = await upsertBriefing(supabase, user.id, briefingContent);
      return NextResponse.json({ success: true, data: saved || briefingContent });
    }

    return NextResponse.json({ success: true, data: { id: `brief-${Date.now()}`, ...briefingContent } });
  } catch (error) {
    console.error("Briefing POST error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
