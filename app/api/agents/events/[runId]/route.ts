import { NextRequest, NextResponse } from "next/server";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

/**
 * GET /api/agents/events/[runId]
 * Stream agent events via Server-Sent Events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  
  // Create a readable stream that proxies the backend SSE
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(`${AGENT_API_URL}/api/agents/events/${runId}`, {
          headers: {
            Accept: "text/event-stream",
          },
        });

        if (!response.ok) {
          controller.enqueue(
            encoder.encode(`data: {"type": "error", "message": "Failed to connect"}\n\n`)
          );
          controller.close();
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            controller.close();
            break;
          }
          
          // Forward the SSE data
          controller.enqueue(value);
        }
      } catch (error) {
        console.error("SSE proxy error:", error);
        controller.enqueue(
          encoder.encode(`data: {"type": "error", "message": "Connection lost"}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
