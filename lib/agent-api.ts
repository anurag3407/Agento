/**
 * CareerPilot Agent API Client
 * ============================
 * Client for interacting with the Python agent backend.
 */

import type {
  AgentStatusResponse,
  RunAgentsRequest,
  InterviewPrepRequest,
  InterviewPrepResponse,
  JobListing,
  UserProfile,
  AgentEvent,
} from "@/types/agents";

const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${AGENT_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// Agent Workflow
// ============================================

/**
 * Trigger the main agent workflow (Scout → Analyzer → Writer → Reporter)
 */
export async function runAgentWorkflow(
  request: RunAgentsRequest
): Promise<AgentStatusResponse> {
  return apiFetch<AgentStatusResponse>("/api/agents/run", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Get the status of an agent run
 */
export async function getAgentStatus(
  runId: string
): Promise<AgentStatusResponse> {
  return apiFetch<AgentStatusResponse>(`/api/agents/status/${runId}`);
}

/**
 * Subscribe to agent events via Server-Sent Events
 */
export function subscribeToAgentEvents(
  runId: string,
  onEvent: (event: AgentEvent | { type: string; data?: unknown; error?: string }) => void,
  onError?: (error: Error) => void
): () => void {
  const url = `${AGENT_API_URL}/api/agents/events/${runId}`;
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
      
      // Close on completion
      if (data.type === "completed" || data.type === "failed") {
        eventSource.close();
      }
    } catch (e) {
      console.error("Failed to parse SSE event:", e);
    }
  };

  eventSource.onerror = (error) => {
    console.error("SSE error:", error);
    onError?.(new Error("Connection lost"));
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

// ============================================
// Interview Preparation
// ============================================

/**
 * Start an interview preparation session
 */
export async function startInterviewPrep(
  request: InterviewPrepRequest
): Promise<InterviewPrepResponse> {
  return apiFetch<InterviewPrepResponse>("/api/interview/start", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Evaluate a behavioral interview answer
 */
export async function evaluateBehavioralAnswer(
  sessionId: string,
  question: string,
  answer: string
): Promise<{ sessionId: string; evaluation: unknown }> {
  return apiFetch(`/api/interview/${sessionId}/evaluate`, {
    method: "POST",
    body: JSON.stringify({ question, answer }),
  });
}

// ============================================
// Quick Actions
// ============================================

/**
 * Quick scan a single job URL
 */
export async function quickScanJob(
  url: string,
  userId: string
): Promise<JobListing> {
  return apiFetch<JobListing>(
    `/api/jobs/quick-scan?url=${encodeURIComponent(url)}&user_id=${userId}`,
    { method: "POST" }
  );
}

// ============================================
// Health Check
// ============================================

/**
 * Check if the agent backend is healthy
 */
export async function checkAgentHealth(): Promise<{
  status: string;
  geminiConfigured: boolean;
  supabaseConfigured: boolean;
  activeRuns: number;
}> {
  return apiFetch("/health");
}

// ============================================
// React Hook for Agent Status Polling
// ============================================

import { useState, useEffect, useCallback } from "react";

export function useAgentRun(runId: string | null) {
  const [status, setStatus] = useState<AgentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!runId) return;
    
    setIsLoading(true);
    try {
      const data = await getAgentStatus(runId);
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    if (!runId) return;

    // Initial fetch
    refresh();

    // Subscribe to SSE events
    const unsubscribe = subscribeToAgentEvents(
      runId,
      (event) => {
        if ("data" in event && event.data) {
          setStatus(event.data as AgentStatusResponse);
        }
      },
      (err) => {
        setError(err);
      }
    );

    return unsubscribe;
  }, [runId, refresh]);

  return { status, isLoading, error, refresh };
}
