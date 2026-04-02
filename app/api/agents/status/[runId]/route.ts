import { NextRequest, NextResponse } from "next/server";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

/**
 * GET /api/agents/status/[runId]
 * Get the status of an agent run
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  
  try {
    const response = await fetch(`${AGENT_API_URL}/api/agents/status/${runId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Run not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to get agent status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent status error:", error);
    return NextResponse.json(
      { error: "Failed to connect to agent service" },
      { status: 500 }
    );
  }
}
