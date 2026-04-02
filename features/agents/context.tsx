"use client";

/**
 * Agent Context
 * =============
 * React context for managing agent workflow state.
 * Provides hooks to trigger and monitor agent runs.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  runAgentWorkflow,
  subscribeToAgentEvents,
  getAgentStatus,
} from "@/lib/agent-api";
import type {
  AgentEvent,
  AgentEventStatus,
  AgentStatusResponse,
  AgentType,
  UserProfile,
} from "@/types/agents";

// ============================================
// Types
// ============================================

interface AgentContextValue {
  // State
  isRunning: boolean;
  currentRunId: string | null;
  events: AgentEvent[];
  status: AgentStatusResponse | null;
  error: string | null;

  // Actions
  startAgentRun: (userId: string, profile?: UserProfile) => Promise<void>;
  clearEvents: () => void;
}

// ============================================
// Context
// ============================================

const AgentContext = createContext<AgentContextValue | null>(null);

// ============================================
// Provider
// ============================================

export function AgentProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<AgentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to events when we have a run ID
  useEffect(() => {
    if (!currentRunId || !isRunning) return;

    const unsubscribe = subscribeToAgentEvents(
      currentRunId,
      (event) => {
        // Handle control events (completed, failed, keepalive)
        if ("type" in event && typeof (event as { type?: string }).type === "string") {
          const eventType = (event as { type: string }).type;
          
          if (eventType === "completed") {
            setIsRunning(false);
            setStatus((event as { data?: unknown }).data as AgentStatusResponse);
          } else if (eventType === "failed") {
            setIsRunning(false);
            setError(((event as { error?: string }).error) || "Agent workflow failed");
          } else if (eventType !== "keepalive") {
            // It's an agent event - convert to AgentEvent shape
            const rawEvent = event as unknown as Record<string, unknown>;
            const agentEvent: AgentEvent = {
              id: (rawEvent.id as string) || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              agent: (rawEvent.agent as AgentType) || "scout",
              message: (rawEvent.message as string) || "",
              status: (rawEvent.status as AgentEventStatus) || "running",
              timestamp: (rawEvent.timestamp as string) || new Date().toISOString(),
              metadata: (rawEvent.metadata as Record<string, unknown>) || {},
            };
            setEvents((prev) => [...prev, agentEvent]);
          }
        }
      },
      (err) => {
        setError(err.message);
        setIsRunning(false);
      }
    );

    return unsubscribe;
  }, [currentRunId, isRunning]);

  // Start an agent run
  const startAgentRun = useCallback(
    async (userId: string, profile?: UserProfile) => {
      try {
        setIsRunning(true);
        setError(null);
        setEvents([]);
        setStatus(null);

        const response = await runAgentWorkflow({
          userId,
          userProfile: profile,
        });

        setCurrentRunId(response.runId);
      } catch (e) {
        setIsRunning(false);
        setError(e instanceof Error ? e.message : "Failed to start agent run");
      }
    },
    []
  );

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        isRunning,
        currentRunId,
        events,
        status,
        error,
        startAgentRun,
        clearEvents,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}

// ============================================
// Hook for Agent Events Display
// ============================================

export function useAgentEvents() {
  const { events, isRunning, clearEvents } = useAgent();

  // Get most recent events (for display)
  const recentEvents = events.slice(-10);

  // Group events by agent
  const eventsByAgent = events.reduce(
    (acc, event) => {
      if (!acc[event.agent]) {
        acc[event.agent] = [];
      }
      acc[event.agent].push(event);
      return acc;
    },
    {} as Record<string, AgentEvent[]>
  );

  return {
    events,
    recentEvents,
    eventsByAgent,
    isRunning,
    clearEvents,
  };
}
