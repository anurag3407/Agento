"use client";

import { motion } from "framer-motion";
import {
  Flame,
  TrendingUp,
  ArrowRight,
  Search,
  BarChart3,
  PenTool,
  Target,
  Mail,
  Calendar,
  Briefcase,
  CheckCircle,
  Clock,
  Sparkles,
  Activity,
  Zap,
  Play,
  FileText,
} from "lucide-react";
import { mockUser } from "@/data/mock-user";
import { mockJobs } from "@/data/mock-jobs";
import { mockApplications } from "@/data/mock-applications";
import { mockAgentEvents } from "@/data/mock-agents";
import { QuickApply } from "@/components/ui/quick-apply";
import { AgentActivityFeed } from "@/components/ui/agent-activity-feed";
import Link from "next/link";

// Agent configuration
const agents = [
  { id: "scout", name: "Scout", icon: Search, color: "var(--color-cyan)", lastRun: "2m ago", status: "running" as const },
  { id: "analyzer", name: "Analyzer", icon: BarChart3, color: "var(--color-amber)", lastRun: "5m ago", status: "idle" as const },
  { id: "writer", name: "Writer", icon: PenTool, color: "var(--color-indigo)", lastRun: "8m ago", status: "idle" as const },
  { id: "coach", name: "Coach", icon: Target, color: "var(--color-emerald)", lastRun: "20m ago", status: "idle" as const },
  { id: "reporter", name: "Reporter", icon: Mail, color: "var(--color-rose)", lastRun: "15m ago", status: "idle" as const },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const topJobs = mockJobs.filter(j => j.scores.composite >= 80).slice(0, 3);
  const highMatches = mockJobs.filter(j => j.scores.composite >= 80).length;
  const pendingApps = mockApplications.filter(a => a.status === "discovered" || a.status === "applied").length;
  const interviewPreps = mockApplications.filter(a => a.status === "interviewing").length;

  // Quick stats data
  const stats = [
    { label: "Jobs Found Today", value: 12, icon: Briefcase, color: "var(--color-cyan)" },
    { label: "High Matches (80%+)", value: highMatches, icon: Sparkles, color: "var(--color-emerald)" },
    { label: "Applications Pending", value: pendingApps, icon: Clock, color: "var(--color-amber)" },
    { label: "Interview Preps Ready", value: interviewPreps, icon: CheckCircle, color: "var(--color-indigo)" },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-6"
    >
      {/* ===== HEADER: Command Center Title ===== */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-emerald-bg)]">
              <Activity className="h-5 w-5 text-[var(--color-emerald)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Command Center
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Welcome back, {mockUser.name} • All systems operational
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-emerald)] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-emerald)]" />
          </span>
          <span className="text-xs font-medium text-[var(--color-emerald)]">Agents Active</span>
        </div>
      </motion.div>

      {/* ===== AGENT STATUS PANEL ===== */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <Zap className="h-4 w-4 text-[var(--color-amber)]" />
            Agent Status
          </h2>
          <button className="flex items-center gap-1.5 rounded-lg bg-[var(--color-emerald)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[var(--color-emerald-hover)] hover:shadow-lg hover:shadow-[var(--color-emerald)]/20">
            <Play className="h-3 w-3" />
            Run All
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isRunning = agent.status === "running";
            return (
              <motion.div
                key={agent.id}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-xl p-4 transition-all cursor-pointer ${
                  isRunning
                    ? "bg-[var(--color-bg-elevated)] border border-[var(--color-border-hover)]"
                    : "bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]"
                }`}
              >
                {isRunning && (
                  <div className="absolute top-2 right-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: agent.color }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: agent.color }} />
                    </span>
                  </div>
                )}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg mb-3"
                  style={{ backgroundColor: `color-mix(in srgb, ${agent.color} 15%, transparent)` }}
                >
                  <Icon className="h-5 w-5" style={{ color: agent.color }} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{agent.name}</h3>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  {isRunning ? (
                    <span className="flex items-center gap-1">
                      <span className="shimmer-bg h-3 w-12 rounded-full inline-block" />
                    </span>
                  ) : (
                    `Last: ${agent.lastRun}`
                  )}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ===== QUICK STATS ROW ===== */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass-card p-4 transition-all hover:border-[var(--color-border-hover)]"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
                >
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
                <span className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</span>
              </div>
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ===== MAIN CONTENT: Top Matches + Activity Feed ===== */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Top Matches Widget - Takes 3 columns */}
        <motion.div variants={item} className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
              <span className="text-[var(--color-amber)]">🏆</span> Top Matches
            </h2>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-xs font-medium text-[var(--color-indigo)] hover:text-[var(--color-indigo-hover)] transition-colors"
            >
              View all jobs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topJobs.map((job, idx) => (
              <Link href={`/jobs/${job.id}`} key={job.id}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="glass-card group cursor-pointer p-4 transition-all hover:border-[var(--color-indigo-border)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/5"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)] text-sm font-bold text-[var(--color-text-muted)]">
                      #{idx + 1}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-indigo)] truncate">
                          {job.title}
                        </h3>
                        {job.isFresh && (
                          <span className="flex items-center gap-1 rounded-full bg-[var(--color-rose-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-rose)]">
                            <Flame className="h-3 w-3" /> New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {job.company} • {job.location}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-center">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                          job.scores.composite >= 90
                            ? "border-[var(--color-emerald)] bg-[var(--color-emerald-bg)]"
                            : "border-[var(--color-amber)] bg-[var(--color-amber-bg)]"
                        }`}
                      >
                        <span
                          className={`text-base font-bold ${
                            job.scores.composite >= 90
                              ? "text-[var(--color-emerald)]"
                              : "text-[var(--color-amber)]"
                          }`}
                        >
                          {job.scores.composite}%
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-lg bg-[var(--color-indigo-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-indigo)]">
                        <FileText className="h-3 w-3" /> Apply
                      </span>
                      <span className="flex items-center gap-1 rounded-lg bg-[var(--color-emerald-bg)] px-3 py-1.5 text-xs font-medium text-[var(--color-emerald)]">
                        <Target className="h-3 w-3" /> Prep
                      </span>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)] pl-12">
                    💡 {job.aiReasoning.slice(0, 120)}...
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity Feed - Takes 2 columns */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="mb-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-emerald)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-emerald)]" />
              </span>
              Recent Activity
              <span className="text-xs font-normal text-[var(--color-text-muted)]">Live</span>
            </h2>
          </div>
          <AgentActivityFeed
            events={mockAgentEvents}
            isLive={true}
            maxItems={6}
            showHeader={false}
          />
        </motion.div>
      </div>

      {/* ===== QUICK APPLY WIDGET ===== */}
      <motion.div variants={item}>
        <div className="mb-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
            <Zap className="h-4 w-4 text-[var(--color-indigo)]" />
            Quick Apply
            <span className="text-xs font-normal text-[var(--color-text-muted)]">
              Paste any job URL for instant analysis
            </span>
          </h2>
        </div>
        <QuickApply userId={mockUser.id} />
      </motion.div>

      {/* ===== NEXT UP: Interview Prep ===== */}
      <motion.div
        variants={item}
        className="glass-card overflow-hidden border-[var(--color-indigo-border)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--color-indigo-bg)]">
            <Target className="h-7 w-7 text-[var(--color-indigo)]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">
                Tomorrow, 4:00 PM
              </span>
              <span className="rounded-full bg-[var(--color-amber-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-amber)]">
                Recommended
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-semibold text-[var(--color-text-primary)]">
              Mock Interview: System Design @ Google
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              <TrendingUp className="mr-1 inline h-3 w-3 text-[var(--color-amber)]" />
              Google asks 40% system design. Focus on scaling read-heavy systems.
            </p>
          </div>
          <div className="flex gap-2 sm:flex-col">
            <Link
              href="/interview"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-indigo)] px-6 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/20"
            >
              <Play className="h-4 w-4" />
              Start Prep
            </Link>
            <Link
              href="/interview"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border-default)] px-4 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
            >
              View All
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
