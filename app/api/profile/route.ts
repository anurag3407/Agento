import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile, upsertProfile } from "@/lib/supabase/queries";
import { mockUser } from "@/data/mock-user";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const profile = await getProfile(supabase, user.id);
      if (profile) {
        return NextResponse.json({
          success: true,
          data: {
            id: profile.id,
            name: profile.name || user.user_metadata?.full_name || user.email?.split("@")[0],
            email: profile.email || user.email,
            avatarUrl: profile.avatar_url || user.user_metadata?.avatar_url,
            title: profile.title || "",
            skills: profile.skills || [],
            careerGoal: profile.career_goal || "",
            onboardingComplete: profile.onboarding_complete || false,
          },
        });
      }
    }

    // Fallback to mock
    return NextResponse.json({
      success: true,
      data: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        avatarUrl: mockUser.avatar,
        title: mockUser.title,
        skills: mockUser.skills,
        careerGoal: mockUser.careerGoal,
        onboardingComplete: true,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.title !== undefined) updates.title = body.title;
    if (body.skills !== undefined) updates.skills = body.skills;
    if (body.careerGoal !== undefined) updates.career_goal = body.careerGoal;
    if (body.preferences !== undefined) updates.preferences = body.preferences;
    if (body.education !== undefined) updates.education = body.education;
    if (body.experience !== undefined) updates.experience = body.experience;
    if (body.onboardingComplete !== undefined) updates.onboarding_complete = body.onboardingComplete;

    const saved = await upsertProfile(supabase, user.id, updates);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
