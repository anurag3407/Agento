import { NextRequest, NextResponse } from "next/server";
import type { RunAgentsRequest, AgentStatusResponse } from "@/types/agents";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

/**
 * POST /api/agents/run
 * Trigger the main agent workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body: RunAgentsRequest = await request.json();

    // Forward to Python backend
    const response = await fetch(`${AGENT_API_URL}/api/agents/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Agent service error" }));
      return NextResponse.json(
        { error: error.detail || "Failed to start agent workflow" },
        { status: response.status }
      );
    }

    const data: AgentStatusResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent run error:", error);
    return NextResponse.json(
      { error: "Failed to connect to agent service" },
      { status: 500 }
    );
  }
}
