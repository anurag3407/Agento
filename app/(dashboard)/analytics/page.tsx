"use client";

import { motion } from "framer-motion";
import { mockAnalytics } from "@/data/mock-analytics";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Send,
  Phone,
  BarChart2,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const stats = [
  {
    label: "Jobs Found",
    value: mockAnalytics.jobsFound,
    delta: mockAnalytics.jobsFoundDelta,
    icon: Briefcase,
    color: "var(--color-indigo)",
  },
  {
    label: "Applied",
    value: mockAnalytics.applied,
    delta: mockAnalytics.appliedDelta,
    icon: Send,
    color: "var(--color-cyan)",
  },
  {
    label: "Callback %",
    value: mockAnalytics.callbackRate,
    delta: mockAnalytics.callbackRateDelta,
    icon: Phone,
    suffix: "%",
    color: "var(--color-emerald)",
  },
  {
    label: "Interviews",
    value: mockAnalytics.interviews,
    delta: mockAnalytics.interviewsDelta,
    icon: BarChart2,
    color: "var(--color-amber)",
  },
];

export default function AnalyticsPage() {
  const maxFunnel = Math.max(...mockAnalytics.funnel.map((f) => f.count));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📈 Analytics</h1>
        <span className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
          Last 30 days
        </span>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.delta >= 0;
          return (
            <div key={stat.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    isPositive
                      ? "bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]"
                      : "bg-[var(--color-rose-bg)] text-[var(--color-rose)]"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {stat.delta}%
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {stat.value}
                {stat.suffix || ""}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {stat.label}
              </p>
            </div>
          );
        })}
      </motion.div>

      {/* Application Funnel */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-5 text-base font-semibold">Application Funnel</h2>
        <div className="space-y-3">
          {mockAnalytics.funnel.map((stage) => (
            <div key={stage.label} className="flex items-center gap-4">
              <span className="w-24 text-sm text-[var(--color-text-secondary)]">
                {stage.label}
              </span>
              <div className="flex-1">
                <div className="h-8 overflow-hidden rounded-lg bg-[var(--color-bg-input)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(stage.count / maxFunnel) * 100}%`,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex h-full items-center rounded-lg px-3"
                    style={{ backgroundColor: stage.color }}
                  >
                    <span className="text-xs font-bold text-white">
                      {stage.count}
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Interview Progress */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="mb-5 text-base font-semibold">Interview Progress</h2>
          <div className="space-y-5">
            {mockAnalytics.interviewProgress.map((prog) => (
              <div key={prog.category}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {prog.category}
                  </span>
                  <span className="text-sm text-[var(--color-emerald)]">
                    +{prog.delta}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 text-right text-xs text-[var(--color-text-muted)]">
                    {prog.before}
                  </span>
                  <div className="flex-1">
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--color-bg-input)]">
                      <div
                        className="absolute h-full rounded-full bg-[var(--color-text-muted)] opacity-30"
                        style={{ width: `${prog.before}%` }}
                      />
                      <motion.div
                        initial={{ width: `${prog.before}%` }}
                        animate={{ width: `${prog.after}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute h-full rounded-full bg-[var(--color-emerald)]"
                      />
                    </div>
                  </div>
                  <span className="w-8 text-xs font-bold text-[var(--color-emerald)]">
                    {prog.after}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Sources */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="mb-5 text-base font-semibold">Top Sources</h2>
          <div className="space-y-3">
            {mockAnalytics.topSources.map((source, idx) => (
              <div
                key={source.name}
                className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-indigo-bg)] text-[10px] font-bold text-[var(--color-indigo)]">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {source.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                  {source.count} jobs
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
