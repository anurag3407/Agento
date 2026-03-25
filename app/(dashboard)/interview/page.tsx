"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Monitor,
  Mic,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Video,
  Dumbbell,
  Clock,
} from "lucide-react";
import { mockSessions, mockWeaknesses } from "@/data/mock-interviews";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const modes = [
  {
    id: "oa",
    label: "OA Simulation",
    icon: Code2,
    desc: "Timed DSA problems at company-specific difficulty",
    color: "var(--color-cyan)",
  },
  {
    id: "code",
    label: "Live Coding",
    icon: Monitor,
    desc: "AI interviewer with real-time feedback and follow-ups",
    color: "var(--color-indigo)",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    icon: Mic,
    desc: "Voice-enabled STAR practice with speech analysis",
    color: "var(--color-emerald)",
  },
];

export default function InterviewPage() {
  const totalSessions = mockSessions.length + 11;
  const avgImprovement = 23;
  const strengths = ["Array/String", "Trees/Graphs", "Dynamic Programming"];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-5xl space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">🎯 Interview Simulator</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Preparing for your next interview with company-specific simulations
        </p>
      </motion.div>

      {/* Mode Cards */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link href="/interview/session" key={mode.id}>
              <div className="glass-card group cursor-pointer p-5 transition-all hover:border-[var(--color-indigo-border)] hover:shadow-lg">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${mode.color} 15%, transparent)`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: mode.color }} />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-indigo)]">
                  {mode.label}
                </h3>
                <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                  {mode.desc}
                </p>
                <div className="mt-4">
                  <span
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all"
                    style={{ backgroundColor: mode.color }}
                  >
                    Start
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-5 text-base font-semibold">📊 Your Stats</h2>

        <div className="mb-5 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[var(--color-bg-card)] p-4">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">
              {totalSessions}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Sessions completed
            </p>
          </div>
          <div className="rounded-lg bg-[var(--color-bg-card)] p-4">
            <p className="text-2xl font-bold text-[var(--color-emerald)]">
              +{avgImprovement}%
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Overall improvement
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Strengths */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">
              Strengths
            </h3>
            <div className="space-y-2">
              {strengths.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 rounded-lg bg-[var(--color-emerald-bg)] px-3 py-2 text-sm text-[var(--color-emerald)]"
                >
                  <CheckCircle2 className="h-4 w-4" /> {s}
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-[var(--color-text-secondary)]">
              Weaknesses
            </h3>
            <div className="space-y-2">
              {mockWeaknesses.map((w) => (
                <div
                  key={w.topic}
                  className="flex items-center justify-between rounded-lg bg-[var(--color-amber-bg)] px-3 py-2 text-sm text-[var(--color-amber)]"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> {w.topic}
                  </span>
                  <span className="text-xs opacity-70">
                    {w.occurrenceCount}×
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Study Plan */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
          📚 Study Plan: {mockWeaknesses[0].topic}
        </h2>
        <div className="space-y-3">
          {mockWeaknesses[0].studyPlan.map((resource, idx) => {
            const Icon =
              resource.type === "book"
                ? BookOpen
                : resource.type === "video"
                  ? Video
                  : Dumbbell;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg bg-[var(--color-bg-card)] p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-indigo-bg)]">
                  <Icon className="h-4 w-4 text-[var(--color-indigo)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {resource.title}
                  </p>
                  <p className="text-[11px] capitalize text-[var(--color-text-muted)]">
                    {resource.type}
                  </p>
                </div>
                {idx === 2 && (
                  <span className="flex items-center gap-1 text-xs text-[var(--color-amber)]">
                    <Clock className="h-3 w-3" /> Re-test Friday
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-4 text-base font-semibold">Recent Sessions</h2>
        <div className="space-y-3">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase text-[var(--color-text-muted)]">
                    {session.sessionType}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {session.company} — {session.role}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {session.improvementNotes}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    session.scores.overall >= 80
                      ? "text-[var(--color-emerald)]"
                      : session.scores.overall >= 60
                        ? "text-[var(--color-amber)]"
                        : "text-[var(--color-rose)]"
                  }`}
                >
                  {session.scores.overall}%
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {getTimeAgo(session.completedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000
  );
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
