"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  Flame,
  TrendingUp,
  ArrowRight,
  Search,
  BarChart3,
  PenTool,
  Target,
  Mail,
  Calendar,
  Lightbulb,
  Zap,
} from "lucide-react";
import { mockUser } from "@/data/mock-user";
import { mockJobs } from "@/data/mock-jobs";
import { mockApplications } from "@/data/mock-applications";
import { mockResumes } from "@/data/mock-resumes";
import { mockAgentEvents } from "@/data/mock-agents";
import Link from "next/link";

const agentIcons: Record<string, typeof Search> = {
  scout: Search,
  analyzer: BarChart3,
  writer: PenTool,
  coach: Target,
  reporter: Mail,
};

const agentColors: Record<string, string> = {
  scout: "var(--color-cyan)",
  analyzer: "var(--color-amber)",
  writer: "var(--color-indigo)",
  coach: "var(--color-emerald)",
  reporter: "var(--color-rose)",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const topJobs = mockJobs.slice(0, 3);
  const pipelineStats = {
    Discovered: mockJobs.length * 8,
    Applied: mockApplications.filter((a) => a.status !== "discovered").length * 3,
    Screening: mockApplications.filter((a) => a.status === "screening").length,
    Interviewing: mockApplications.filter((a) => a.status === "interviewing").length,
    Offered: 0,
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Good evening, {mockUser.name} 👋
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          CareerPilot found{" "}
          <span className="font-semibold text-[var(--color-indigo)]">
            8 new matches
          </span>{" "}
          today •{" "}
          <span className="font-semibold text-[var(--color-amber)]">
            3 applications
          </span>{" "}
          pending review
        </p>
      </motion.div>

      {/* Quick Apply */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-indigo-bg)]">
            <Zap className="h-5 w-5 text-[var(--color-indigo)]" />
          </div>
          <div className="flex flex-1 items-center gap-2">
            <input
              type="url"
              placeholder="Paste a job URL for instant analysis..."
              className="h-11 flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-indigo)] focus:outline-none"
            />
            <button className="flex h-11 items-center gap-2 rounded-lg bg-[var(--color-indigo)] px-5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/20">
              <Rocket className="h-4 w-4" />
              Go
            </button>
          </div>
        </div>
      </motion.div>

      {/* Top 3 Matches */}
      <motion.div variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-[var(--color-amber)]">🏆</span> Top Matches
          </h2>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-xs font-medium text-[var(--color-indigo)] hover:text-[var(--color-indigo-hover)]"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {topJobs.map((job, idx) => (
            <Link href={`/jobs/${job.id}`} key={job.id}>
              <div className="glass-card group cursor-pointer p-4 transition-all hover:border-[var(--color-indigo-border)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {job.isFresh && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--color-rose-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-rose)]">
                          <Flame className="h-3 w-3" /> New
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
                        #{idx + 1}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-indigo)]">
                      {job.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--color-emerald)] bg-[var(--color-emerald-bg)]">
                      <span className="text-sm font-bold text-[var(--color-emerald)]">
                        {job.scores.composite}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
                  &ldquo;{job.aiReasoning.slice(0, 100)}...&rdquo;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Pipeline + What's Working */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pipeline */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <span>📊</span> Pipeline
          </h3>
          <div className="space-y-3">
            {Object.entries(pipelineStats).map(([label, count]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {label}
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--color-bg-input)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-indigo)] transition-all"
                      style={{
                        width: `${Math.min((count / 50) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What's Working */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <span>📈</span> What&apos;s Working
          </h3>
          <div className="space-y-3">
            {mockResumes.map((resume) => (
              <div key={resume.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      resume.callbackRate >= 30
                        ? "text-[var(--color-emerald)]"
                        : resume.callbackRate >= 20
                          ? "text-[var(--color-amber)]"
                          : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {resume.callbackRate >= 30 ? "✅" : "⚠️"}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {resume.framingStrategy}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--color-bg-input)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${resume.callbackRate}%`,
                        backgroundColor:
                          resume.callbackRate >= 30
                            ? "var(--color-emerald)"
                            : "var(--color-amber)",
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-semibold text-[var(--color-text-primary)]">
                    {resume.callbackRate}% CB
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-[var(--color-indigo-bg)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)]">
              <Lightbulb className="mr-1 inline h-3 w-3 text-[var(--color-indigo)]" />
              <span className="font-medium text-[var(--color-indigo)]">
                Insight:
              </span>{" "}
              Backend-heavy framing outperforms by 83%. Lead with
              systems/infrastructure experience.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Agent Activity */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-emerald)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-emerald)]" />
          </span>
          Agent Activity
          <span className="text-xs font-normal text-[var(--color-text-muted)]">
            Live
          </span>
        </h3>
        <div className="space-y-2.5">
          {mockAgentEvents.map((event, idx) => {
            const Icon = agentIcons[event.agent];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--color-bg-card)]"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${agentColors[event.agent]} 15%, transparent)`,
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: agentColors[event.agent] }}
                  />
                </div>
                <span className="flex-1 text-sm text-[var(--color-text-secondary)]">
                  {event.message}
                </span>
                {event.status === "running" && (
                  <span className="shimmer-bg h-5 w-16 rounded-full" />
                )}
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {getTimeAgo(event.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Next Up */}
      <motion.div
        variants={item}
        className="glass-card overflow-hidden border-[var(--color-indigo-border)]"
      >
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-indigo-bg)]">
            <Target className="h-6 w-6 text-[var(--color-indigo)]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">
                Tomorrow, 4:00 PM
              </span>
            </div>
            <h3 className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              Mock Interview: System Design @ Google
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              <TrendingUp className="mr-1 inline h-3 w-3 text-[var(--color-amber)]" />
              Google asks 40% system design. Focus on scaling read-heavy
              systems.
            </p>
          </div>
          <Link
            href="/interview"
            className="flex h-10 items-center gap-2 rounded-lg bg-[var(--color-indigo)] px-5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg"
          >
            Start
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
