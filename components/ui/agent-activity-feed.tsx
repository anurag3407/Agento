"use client";

/**
 * Agent Activity Feed
 * ==================
 * Real-time feed showing agent activities.
 * Displays status updates from Scout, Analyzer, Writer, Coach, and Reporter.
 */

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BarChart3,
  PenTool,
  Target,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { AgentEvent, AgentType, AgentEventStatus } from "@/types/agents";

// ============================================
// Agent Icons & Colors
// ============================================

const agentConfig: Record<
  AgentType,
  { icon: typeof Search; color: string; label: string }
> = {
  scout: {
    icon: Search,
    color: "var(--color-cyan)",
    label: "Scout",
  },
  analyzer: {
    icon: BarChart3,
    color: "var(--color-amber)",
    label: "Analyzer",
  },
  writer: {
    icon: PenTool,
    color: "var(--color-indigo)",
    label: "Writer",
  },
  coach: {
    icon: Target,
    color: "var(--color-emerald)",
    label: "Coach",
  },
  reporter: {
    icon: Mail,
    color: "var(--color-rose)",
    label: "Reporter",
  },
};

const statusIcons: Record<AgentEventStatus, typeof Loader2> = {
  running: Loader2,
  completed: CheckCircle,
  failed: AlertCircle,
};

// ============================================
// Props
// ============================================

interface AgentActivityFeedProps {
  events: AgentEvent[];
  isLive?: boolean;
  maxItems?: number;
  compact?: boolean;
  showHeader?: boolean;
}

// ============================================
// Component
// ============================================

export function AgentActivityFeed({
  events,
  isLive = false,
  maxItems = 5,
  compact = false,
  showHeader = true,
}: AgentActivityFeedProps) {
  const displayedEvents = events.slice(-maxItems).reverse();

  return (
    <div className={compact ? "" : "glass-card p-5"}>
      {showHeader && (
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-emerald)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-emerald)]" />
            </span>
          )}
          Agent Activity
          {isLive && (
            <span className="text-xs font-normal text-[var(--color-text-muted)]">
              Live
            </span>
          )}
        </h3>
      )}

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {displayedEvents.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 text-center text-sm text-[var(--color-text-muted)]"
            >
              No activity yet. Start the agents to see updates here.
            </motion.p>
          ) : (
            displayedEvents.map((event, idx) => (
              <AgentEventItem
                key={event.id}
                event={event}
                index={idx}
                compact={compact}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// Event Item
// ============================================

interface AgentEventItemProps {
  event: AgentEvent;
  index: number;
  compact?: boolean;
}

function AgentEventItem({ event, index, compact }: AgentEventItemProps) {
  const config = agentConfig[event.agent];
  const Icon = config.icon;
  const StatusIcon = statusIcons[event.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--color-bg-card)] ${
        compact ? "text-xs" : ""
      }`}
    >
      {/* Agent Icon */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{
          backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`,
        }}
      >
        <Icon
          className="h-3.5 w-3.5"
          style={{ color: config.color }}
        />
      </div>

      {/* Message */}
      <span className="flex-1 text-sm text-[var(--color-text-secondary)]">
        {event.message}
      </span>

      {/* Status Indicator */}
      {event.status === "running" ? (
        <span className="shimmer-bg h-5 w-16 rounded-full" />
      ) : event.status === "completed" ? (
        <CheckCircle className="h-4 w-4 text-[var(--color-emerald)]" />
      ) : event.status === "failed" ? (
        <AlertCircle className="h-4 w-4 text-[var(--color-rose)]" />
      ) : null}

      {/* Time */}
      <span className="text-[11px] text-[var(--color-text-muted)]">
        {formatTimeAgo(event.timestamp)}
      </span>
    </motion.div>
  );
}

// ============================================
// Helpers
// ============================================

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ============================================
// Skeleton Loader
// ============================================

export function AgentActivitySkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="glass-card p-5">
      <div className="mb-4 h-5 w-32 shimmer-bg rounded" />
      <div className="space-y-2.5">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className="h-7 w-7 shimmer-bg rounded-md" />
            <div className="h-4 flex-1 shimmer-bg rounded" />
            <div className="h-4 w-12 shimmer-bg rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Mini Status Badge (for nav/header)
// ============================================

interface AgentStatusBadgeProps {
  isRunning: boolean;
  agentType?: AgentType;
}

export function AgentStatusBadge({ isRunning, agentType }: AgentStatusBadgeProps) {
  if (!isRunning) return null;

  const config = agentType ? agentConfig[agentType] : null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="flex items-center gap-2 rounded-full bg-[var(--color-indigo-bg)] px-3 py-1.5"
    >
      <Loader2 className="h-3 w-3 animate-spin text-[var(--color-indigo)]" />
      <span className="text-xs font-medium text-[var(--color-indigo)]">
        {config ? config.label : "Agents"} running...
      </span>
    </motion.div>
  );
}
