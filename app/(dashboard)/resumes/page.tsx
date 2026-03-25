"use client";

import { motion } from "framer-motion";
import { mockResumes } from "@/data/mock-resumes";
import {
  Plus,
  Download,
  Eye,
  Edit3,
  Send,
  TrendingUp,
  Lightbulb,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function ResumesPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex items-center justify-between"
      >
        <h1 className="text-2xl font-bold">✍️ Resume Vault</h1>
        <button className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)]">
          <Plus className="h-4 w-4" /> Generate New
        </button>
      </motion.div>

      {/* A/B Performance */}
      <motion.div variants={item} className="glass-card p-6">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold">
          <span>📊</span> A/B Performance
        </h2>

        <div className="space-y-4">
          {mockResumes.map((resume) => {
            const isWinner = resume.callbackRate >= 30;
            return (
              <div key={resume.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
                    {resume.framingStrategy} {resume.variantTag.split("-").pop()}
                    {isWinner && (
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-emerald)]" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isWinner
                        ? "text-[var(--color-emerald)]"
                        : "text-[var(--color-amber)]"
                    }`}
                  >
                    {resume.callbackRate}% callback
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-bg-input)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${resume.callbackRate}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: isWinner
                        ? "var(--color-emerald)"
                        : "var(--color-amber)",
                    }}
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {resume.callbackCount} callbacks from {resume.totalSent} sent
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-lg bg-[var(--color-indigo-bg)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <Lightbulb className="mr-1.5 inline h-4 w-4 text-[var(--color-indigo)]" />
            <span className="font-semibold text-[var(--color-indigo)]">
              Insight:
            </span>{" "}
            Backend-heavy framing outperforms by 83%. Recommendation: Lead with
            systems/infrastructure experience.
          </p>
        </div>
      </motion.div>

      {/* Resume Cards */}
      <div className="space-y-4">
        {mockResumes.map((resume) => (
          <motion.div key={resume.id} variants={item} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-indigo-bg)]">
                  <FileText className="h-5 w-5 text-[var(--color-indigo)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                    Resume for {resume.targetCompany} —{" "}
                    {resume.framingStrategy} {resume.variantTag.split("-").pop()}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{" "}
                      {getTimeAgo(resume.createdAt)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        resume.status === "ready"
                          ? "bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]"
                          : resume.status === "applied"
                            ? "bg-[var(--color-cyan-bg)] text-[var(--color-cyan)]"
                            : "bg-[var(--color-amber-bg)] text-[var(--color-amber)]"
                      }`}
                    >
                      {resume.status}
                    </span>
                  </div>
                  {resume.companyNewsUsed && (
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      <TrendingUp className="mr-1 inline h-3 w-3 text-[var(--color-emerald)]" />
                      Company news used: &ldquo;{resume.companyNewsUsed}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <ActionButton icon={Eye} label="Preview" />
                <ActionButton icon={Download} label="PDF" />
                <ActionButton icon={Edit3} label="Edit" />
                <ActionButton icon={Send} label="Email" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ActionButton({
  icon: Icon,
  label,
}: {
  icon: typeof Eye;
  label: string;
}) {
  return (
    <button
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / 1000
  );
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
