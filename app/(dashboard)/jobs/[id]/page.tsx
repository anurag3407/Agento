"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { mockJobs } from "@/data/mock-jobs";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Zap,
  PenTool,
  FileText,
  Target,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const job = mockJobs.find((j) => j.id === params.id);

  if (!job) {
    return (
      <div className="flex h-96 items-center justify-center text-[var(--color-text-muted)]">
        Job not found
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      {/* Back + Title */}
      <div>
        <Link
          href="/jobs"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {job.isFresh && (
                <span className="flex items-center gap-1 rounded-full bg-[var(--color-rose-bg)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-rose)]">
                  <Flame className="h-3 w-3" /> NEW
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {job.title} — {job.company}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
              {job.salary && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> {job.salary}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Posted {getTimeAgo(job.postedAt)}
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/20">
            <Zap className="h-4 w-4" /> Apply
          </button>
        </div>
      </div>

      {/* Match Breakdown */}
      <div className="glass-card p-6">
        <h2 className="mb-5 text-base font-semibold">Match Breakdown</h2>
        <div className="space-y-5">
          <ScoreBar label="Skills Match" score={job.scores.skills}>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.requiredSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-[var(--color-emerald-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-emerald)]"
                >
                  <CheckCircle2 className="mr-0.5 inline h-3 w-3" /> {s}
                </span>
              ))}
              {job.niceToHaveSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-[var(--color-amber-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-amber)]"
                >
                  <XCircle className="mr-0.5 inline h-3 w-3" /> {s}
                </span>
              ))}
            </div>
          </ScoreBar>

          <ScoreBar label="Culture Fit" score={job.scores.culture}>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Glassdoor: 4.2★ • Work-Life Balance: 3.8 • Engineering
              Culture: A+
            </p>
          </ScoreBar>

          <ScoreBar label="Career Trajectory" score={job.scores.trajectory}>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              &ldquo;This role builds directly toward your goal of technical
              leadership in distributed systems.&rdquo;
            </p>
          </ScoreBar>
        </div>
      </div>

      {/* Hidden Requirements */}
      {job.hiddenRequirements.length > 0 && (
        <div className="glass-card border-[var(--color-amber)]/20 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-5 w-5 text-[var(--color-amber)]" />
            Hidden Requirements
          </h2>
          <div className="space-y-3">
            {job.hiddenRequirements.map((req, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg bg-[var(--color-bg-card)] p-3"
              >
                <span
                  className={`mt-0.5 text-xs ${
                    req.severity === "critical"
                      ? "text-[var(--color-rose)]"
                      : req.severity === "warning"
                        ? "text-[var(--color-amber)]"
                        : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {req.severity === "critical"
                    ? "🔴"
                    : req.severity === "warning"
                      ? "🟡"
                      : "🔵"}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {req.signal}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    → {req.interpretation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      <div className="glass-card border-[var(--color-indigo-border)] p-6">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="h-5 w-5 text-[var(--color-indigo)]" />
          AI Reasoning
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          &ldquo;{job.aiReasoning}&rdquo;
        </p>
      </div>

      {/* Description */}
      <div className="glass-card p-6">
        <h2 className="mb-3 text-base font-semibold">Job Description</h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {job.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-indigo-hover)]">
          <PenTool className="h-4 w-4" /> Generate Resume
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-border-hover)]">
          <FileText className="h-4 w-4" /> Draft Cover Letter
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-border-hover)]">
          <Target className="h-4 w-4" /> Mock Interview
        </button>
      </div>
    </motion.div>
  );
}

function ScoreBar({
  label,
  score,
  children,
}: {
  label: string;
  score: number;
  children?: React.ReactNode;
}) {
  const color =
    score >= 85
      ? "var(--color-emerald)"
      : score >= 70
        ? "var(--color-amber)"
        : "var(--color-text-muted)";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-input)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {children}
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000
  );
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
