"use client";

import { motion } from "framer-motion";
import { mockApplications } from "@/data/mock-applications";
import type { ApplicationStatus } from "@/types";
import { Clock, CheckCircle2, XCircle, PhoneCall, Gift, Eye } from "lucide-react";

const columns: { status: ApplicationStatus; label: string; color: string; icon: typeof Clock }[] = [
  { status: "discovered", label: "Discovered", color: "var(--color-text-muted)", icon: Eye },
  { status: "applied", label: "Applied", color: "var(--color-cyan)", icon: Clock },
  { status: "screening", label: "Screening", color: "var(--color-amber)", icon: PhoneCall },
  { status: "interviewing", label: "Interviewing", color: "var(--color-indigo)", icon: PhoneCall },
  { status: "offered", label: "Offered", color: "var(--color-emerald)", icon: Gift },
  { status: "rejected", label: "Rejected", color: "var(--color-rose)", icon: XCircle },
];

export default function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-2xl font-bold">📝 Applications</h1>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4 md:grid-cols-6">
        {columns.map((col) => {
          const count = mockApplications.filter((a) => a.status === col.status).length;
          const Icon = col.icon;
          return (
            <div key={col.status} className="glass-card p-3 text-center">
              <Icon className="mx-auto h-4 w-4 mb-1" style={{ color: col.color }} />
              <p className="text-xl font-bold" style={{ color: col.color }}>
                {count}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">{col.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline columns */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {columns.map((col) => {
          const apps = mockApplications.filter((a) => a.status === col.status);
          return (
            <div key={col.status}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  {col.label}
                </span>
                <span className="ml-auto rounded-full bg-[var(--color-bg-card)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                  {apps.length}
                </span>
              </div>
              <div className="space-y-2">
                {apps.map((app, idx) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card cursor-pointer p-3 transition-all hover:border-[var(--color-border-hover)]"
                  >
                    <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                      {app.job.title}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                      {app.job.company}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {getTimeAgo(app.lastUpdated)}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${col.color} 15%, transparent)`,
                          color: col.color,
                        }}
                      >
                        {app.job.scores.composite}%
                      </span>
                    </div>
                    {app.rejectionReason && (
                      <p className="mt-2 rounded bg-[var(--color-rose-bg)] p-1.5 text-[10px] text-[var(--color-rose)]">
                        {app.rejectionReason}
                      </p>
                    )}
                  </motion.div>
                ))}
                {apps.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[var(--color-border-default)] p-4 text-center text-xs text-[var(--color-text-muted)]">
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
