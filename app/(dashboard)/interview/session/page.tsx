"use client";

import { motion } from "framer-motion";
import { Code2, Clock, Lightbulb, Play, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function InterviewSessionPage() {
  const [started, setStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const problem = {
    title: "Design a Rate Limiter",
    company: "Stripe",
    difficulty: "Medium",
    timeLimit: "45 min",
    description:
      "Design and implement a rate limiter that can be used to throttle API requests. The rate limiter should support a sliding window approach and handle distributed scenarios.\n\nRequirements:\n- Support configurable rate limits (e.g., 100 requests per minute)\n- Use a sliding window algorithm\n- Handle concurrent requests safely\n- Provide clear error messages when rate limit is exceeded",
    hints: [
      "Think about what data structure would efficiently track timestamps of requests",
      "Consider using a sorted set or deque to maintain the sliding window",
      "For the distributed case, think about how Redis MULTI/EXEC can help",
    ],
  };

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-indigo-bg)]">
          <Code2 className="h-10 w-10 text-[var(--color-indigo)]" />
        </div>
        <h1 className="text-2xl font-bold">OA Simulation</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Preparing for: Senior Backend Engineer @ Stripe
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Difficulty: Medium • Time: 45 minutes • 1 problem
        </p>
        <button
          onClick={() => setStarted(true)}
          className="mt-8 flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/20"
        >
          <Play className="h-4 w-4" /> Start Session
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl"
    >
      {/* Timer bar */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">
            {problem.company} — {problem.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm font-mono font-semibold text-[var(--color-amber)]">
            <Clock className="h-4 w-4" /> 42:37
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 rounded-lg bg-[var(--color-amber-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-amber)]"
          >
            <Lightbulb className="h-3.5 w-3.5" /> Hint
          </button>
          <button
            onClick={() => setStarted(false)}
            className="flex items-center gap-1 rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Hint panel */}
      {showHint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 rounded-lg border border-[var(--color-amber)]/20 bg-[var(--color-amber-bg)] p-4"
        >
          <p className="text-xs font-medium text-[var(--color-amber)]">
            💡 Hint: {problem.hints[0]}
          </p>
        </motion.div>
      )}

      <div className="grid h-[calc(100vh-220px)] grid-cols-2 gap-4">
        {/* Problem description */}
        <div className="glass-card overflow-y-auto p-5">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            {problem.title}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-amber-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-amber)]">
              {problem.difficulty}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {problem.company}
            </span>
          </div>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {problem.description}
          </div>
        </div>

        {/* Code editor area */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] px-4 py-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Python
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button className="rounded bg-[var(--color-emerald)] px-4 py-1.5 text-xs font-semibold text-white">
                Run
              </button>
              <button className="rounded bg-[var(--color-indigo)] px-4 py-1.5 text-xs font-semibold text-white">
                Submit
              </button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <pre className="font-mono text-sm text-[var(--color-text-secondary)]">
              <code>{`import collections
import time

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = collections.deque()
    
    def is_allowed(self, client_id: str) -> bool:
        """Check if a request is allowed under the rate limit."""
        current_time = time.time()
        
        # Remove expired timestamps
        while self.requests and self.requests[0] < current_time - self.window_seconds:
            self.requests.popleft()
        
        if len(self.requests) < self.max_requests:
            self.requests.append(current_time)
            return True
        
        return False
    
    # TODO: Add distributed support
    # TODO: Add per-client tracking
`}</code>
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
