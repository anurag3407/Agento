"use client";

import { motion } from "framer-motion";
import { mockAnalytics } from "@/data/mock-analytics";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Send,
  Phone,
  BarChart2,
  Calendar,
  FileText,
  Zap,
  Target,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const timePeriods = ["Last 7 days", "Last 30 days", "All time"] as const;
type TimePeriod = (typeof timePeriods)[number];

// Mock data for weekly activity (jobs found per day)
const weeklyActivity = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 18 },
  { day: "Wed", count: 8 },
  { day: "Thu", count: 24 },
  { day: "Fri", count: 15 },
  { day: "Sat", count: 6 },
  { day: "Sun", count: 4 },
];

// Mock data for score distribution
const scoreDistribution = [
  { range: "90-100%", count: 8, color: "var(--color-emerald)" },
  { range: "80-89%", count: 23, color: "var(--color-cyan)" },
  { range: "70-79%", count: 45, color: "var(--color-indigo)" },
  { range: "60-69%", count: 38, color: "var(--color-amber)" },
  { range: "<60%", count: 33, color: "var(--color-rose)" },
];

// Mock data for resume performance
const resumePerformance = [
  { name: "Backend-focused", applied: 12, callbacks: 5, rate: 42 },
  { name: "Full-stack", applied: 8, callbacks: 2, rate: 25 },
  { name: "Leadership", applied: 3, callbacks: 1, rate: 33 },
];

// Mock data for skills demand
const skillsDemand = [
  { skill: "TypeScript", demand: 89, trend: 12 },
  { skill: "React", demand: 82, trend: 5 },
  { skill: "Node.js", demand: 76, trend: -3 },
  { skill: "Python", demand: 71, trend: 8 },
  { skill: "AWS", demand: 68, trend: 15 },
  { skill: "PostgreSQL", demand: 54, trend: 2 },
];

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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("Last 30 days");
  const maxFunnel = Math.max(...mockAnalytics.funnel.map((f) => f.count));
  const maxWeekly = Math.max(...weeklyActivity.map((d) => d.count));
  const totalScoreCount = scoreDistribution.reduce((a, b) => a + b.count, 0);

  // Calculate pie chart segments for conic-gradient
  let cumulativePercent = 0;
  const pieSegments = scoreDistribution.map((segment) => {
    const percent = (segment.count / totalScoreCount) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return { ...segment, start, end: cumulativePercent, percent };
  });

  const conicGradient = pieSegments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(", ");

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Header with Time Period Selector */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">📈 Analytics</h1>
        <div className="flex items-center gap-2">
          {timePeriods.map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                timePeriod === period
                  ? "border-[var(--color-indigo-border)] bg-[var(--color-indigo-bg)] text-[var(--color-indigo)]"
                  : "border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {period}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive = stat.delta >= 0;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className="glass-card p-5 transition-all hover:border-[var(--color-border-hover)]"
            >
              <div className="mb-3 flex items-center justify-between">
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
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
                className="text-2xl font-bold text-[var(--color-text-primary)]"
              >
                {stat.value}
                {stat.suffix || ""}
              </motion.p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Application Funnel - Visual Funnel */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-[var(--color-indigo)]" />
          <h2 className="text-base font-semibold">Application Funnel</h2>
        </div>
        <div className="relative">
          {/* Funnel visualization */}
          <div className="flex flex-col items-center gap-1">
            {mockAnalytics.funnel.map((stage, idx) => {
              const widthPercent = Math.max(
                20,
                ((stage.count / maxFunnel) * 100 * 0.8) + 20
              );
              const conversionRate =
                idx > 0
                  ? ((stage.count / mockAnalytics.funnel[idx - 1].count) * 100).toFixed(0)
                  : null;
              return (
                <motion.div
                  key={stage.label}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${widthPercent}%`, opacity: 1 }}
                  transition={{ delay: idx * 0.15, duration: 0.6, ease: "easeOut" }}
                  className="relative flex items-center justify-between rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: stage.color,
                    minHeight: "48px",
                  }}
                >
                  <span className="text-sm font-semibold text-white">{stage.label}</span>
                  <div className="flex items-center gap-3">
                    {conversionRate && (
                      <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                        {conversionRate}% conv
                      </span>
                    )}
                    <span className="text-lg font-bold text-white">{stage.count}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* Funnel arrows */}
          <div className="absolute -right-2 top-0 flex h-full flex-col justify-around">
            {mockAnalytics.funnel.slice(0, -1).map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.3, x: 0 }}
                transition={{ delay: idx * 0.15 + 0.3 }}
                className="text-2xl text-[var(--color-text-muted)]"
              >
                ↓
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Weekly Activity + Score Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Activity Bar Chart */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[var(--color-cyan)]" />
            <h2 className="text-base font-semibold">Weekly Activity</h2>
          </div>
          <div className="flex h-48 items-end justify-between gap-2">
            {weeklyActivity.map((day, idx) => {
              const heightPercent = (day.count / maxWeekly) * 100;
              return (
                <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ delay: idx * 0.08, duration: 0.5, ease: "easeOut" }}
                    className="relative w-full min-h-[4px] rounded-t-md transition-all hover:opacity-80"
                    style={{
                      background: `linear-gradient(to top, var(--color-cyan), color-mix(in srgb, var(--color-cyan) 60%, var(--color-indigo)))`,
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.08 + 0.3 }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[var(--color-text-primary)]"
                    >
                      {day.count}
                    </motion.span>
                  </motion.div>
                  <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3">
            <span className="text-xs text-[var(--color-text-muted)]">Jobs discovered this week</span>
            <span className="text-sm font-bold text-[var(--color-cyan)]">
              {weeklyActivity.reduce((a, b) => a + b.count, 0)} total
            </span>
          </div>
        </motion.div>

        {/* Score Distribution - Pie Chart */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-[var(--color-amber)]" />
            <h2 className="text-base font-semibold">Score Distribution</h2>
          </div>
          <div className="flex items-center gap-6">
            {/* Pie Chart */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative h-36 w-36 shrink-0"
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: `conic-gradient(${conicGradient})`,
                }}
              />
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-[var(--color-bg-primary)]">
                <span className="text-xl font-bold text-[var(--color-text-primary)]">
                  {totalScoreCount}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">jobs</span>
              </div>
            </motion.div>
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {pieSegments.map((segment, idx) => (
                <motion.div
                  key={segment.range}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {segment.range}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {segment.count}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Resume Performance + Skills Demand */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Resume Performance */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--color-emerald)]" />
            <h2 className="text-base font-semibold">Resume Performance</h2>
          </div>
          <div className="space-y-4">
            {resumePerformance.map((resume, idx) => {
              const barColor =
                resume.rate >= 40
                  ? "var(--color-emerald)"
                  : resume.rate >= 30
                    ? "var(--color-amber)"
                    : "var(--color-rose)";
              return (
                <motion.div
                  key={resume.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg bg-[var(--color-bg-card)] p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {resume.name}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${barColor} 15%, transparent)`,
                        color: barColor,
                      }}
                    >
                      {resume.rate}% callback
                    </span>
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-[var(--color-bg-input)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${resume.rate}%` }}
                      transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--color-text-muted)]">
                    <span>{resume.applied} applied</span>
                    <span>{resume.callbacks} callbacks</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 rounded-lg bg-[var(--color-emerald-bg)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-emerald)]">💡 Insight:</span>{" "}
              Backend-focused resume outperforms by 68%. Consider leading with systems experience.
            </p>
          </div>
        </motion.div>

        {/* Skills Demand */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-[var(--color-indigo)]" />
            <h2 className="text-base font-semibold">Skills Demand</h2>
          </div>
          <div className="space-y-3">
            {skillsDemand.map((skill, idx) => (
              <motion.div
                key={skill.skill}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {skill.skill}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                        skill.trend >= 0 ? "text-[var(--color-emerald)]" : "text-[var(--color-rose)]"
                      }`}
                    >
                      {skill.trend >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {skill.trend >= 0 ? "+" : ""}
                      {skill.trend}%
                    </span>
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                      {skill.demand}%
                    </span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-input)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.demand}%` }}
                    transition={{ delay: idx * 0.08 + 0.2, duration: 0.5 }}
                    className="h-full rounded-full transition-all group-hover:opacity-80"
                    style={{
                      background: `linear-gradient(to right, var(--color-indigo), var(--color-cyan))`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-xs text-[var(--color-text-muted)]">
            Based on {totalScoreCount} matched jobs
          </div>
        </motion.div>
      </div>

      {/* Interview Progress + Top Sources */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Interview Progress */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="mb-5 text-base font-semibold">🎯 Interview Progress</h2>
          <div className="space-y-5">
            {mockAnalytics.interviewProgress.map((prog, idx) => (
              <motion.div
                key={prog.category}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.15 }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {prog.category}
                  </span>
                  <span className="text-sm font-bold text-[var(--color-emerald)]">+{prog.delta}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 text-right text-xs text-[var(--color-text-muted)]">
                    {prog.before}
                  </span>
                  <div className="flex-1">
                    <div className="relative h-3 overflow-hidden rounded-full bg-[var(--color-bg-input)]">
                      <div
                        className="absolute h-full rounded-full bg-[var(--color-text-muted)] opacity-20"
                        style={{ width: `${prog.before}%` }}
                      />
                      <motion.div
                        initial={{ width: `${prog.before}%` }}
                        animate={{ width: `${prog.after}%` }}
                        transition={{ delay: idx * 0.15 + 0.3, duration: 0.8, ease: "easeOut" }}
                        className="absolute h-full rounded-full bg-[var(--color-emerald)]"
                      />
                    </div>
                  </div>
                  <span className="w-8 text-xs font-bold text-[var(--color-emerald)]">
                    {prog.after}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Sources */}
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="mb-5 text-base font-semibold">🔗 Top Sources</h2>
          <div className="space-y-2">
            {mockAnalytics.topSources.map((source, idx) => {
              const maxSource = Math.max(...mockAnalytics.topSources.map((s) => s.count));
              const barWidth = (source.count / maxSource) * 100;
              return (
                <motion.div
                  key={source.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="group relative overflow-hidden rounded-lg bg-[var(--color-bg-card)] px-4 py-3"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ delay: idx * 0.08 + 0.2, duration: 0.5 }}
                    className="absolute inset-y-0 left-0 bg-[var(--color-indigo-bg)] opacity-50"
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-indigo-bg)] text-[10px] font-bold text-[var(--color-indigo)]">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {source.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text-secondary)]">
                      {source.count} jobs
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
