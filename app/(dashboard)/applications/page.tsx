"use client";

import { useState, useMemo } from "react";
import { motion, Reorder, useDragControls, AnimatePresence } from "framer-motion";
import { mockApplications } from "@/data/mock-applications";
import type { Application, ApplicationStatus } from "@/types";
import {
  Eye,
  Send,
  PhoneCall,
  MessageSquare,
  Gift,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Filter,
  GripVertical,
} from "lucide-react";

type KanbanStatus = "discovered" | "applied" | "screening" | "interviewing" | "offered";

interface KanbanColumn {
  status: KanbanStatus;
  label: string;
  color: string;
  icon: typeof Eye;
  action?: { label: string; icon: typeof Calendar };
}

const columns: KanbanColumn[] = [
  { status: "discovered", label: "Discovered", color: "var(--color-text-muted)", icon: Eye },
  { status: "applied", label: "Applied", color: "var(--color-cyan)", icon: Send },
  {
    status: "screening",
    label: "Screening",
    color: "var(--color-amber)",
    icon: PhoneCall,
    action: { label: "Prep Call", icon: Calendar },
  },
  {
    status: "interviewing",
    label: "Interviewing",
    color: "var(--color-indigo)",
    icon: MessageSquare,
    action: { label: "Schedule Prep", icon: Calendar },
  },
  {
    status: "offered",
    label: "Offered",
    color: "var(--color-emerald)",
    icon: Gift,
    action: { label: "Compare Offers", icon: TrendingUp },
  },
];

const companyColors: Record<string, string> = {
  S: "#635BFF", // Stripe purple
  V: "#000000", // Vercel black
  N: "#FFFFFF", // Notion white
  D: "#632CA6", // Datadog purple
  L: "#5E6AD2", // Linear blue
  R: "#528FF0", // Razorpay blue
};

type TimeFilter = "all" | "7days" | "30days";

export default function ApplicationsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const filteredApplications = useMemo(() => {
    const now = Date.now();
    const dayMs = 86400 * 1000;

    return applications.filter((app) => {
      // Exclude rejected from kanban view
      if (app.status === "rejected") return false;

      const appliedTime = new Date(app.appliedAt).getTime();
      if (timeFilter === "7days") return now - appliedTime <= 7 * dayMs;
      if (timeFilter === "30days") return now - appliedTime <= 30 * dayMs;
      return true;
    });
  }, [applications, timeFilter]);

  // Stats calculations
  const stats = useMemo(() => {
    const total = applications.filter((a) => a.status !== "discovered").length;
    const withResponse = applications.filter((a) =>
      ["screening", "interviewing", "offered", "rejected"].includes(a.status)
    ).length;
    const interviews = applications.filter((a) =>
      ["interviewing", "offered"].includes(a.status)
    ).length;
    const offers = applications.filter((a) => a.status === "offered").length;

    return {
      total,
      responseRate: total > 0 ? Math.round((withResponse / total) * 100) : 0,
      interviews,
      offers,
    };
  }, [applications]);

  const handleDragEnd = (appId: string, newStatus: KanbanStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? { ...app, status: newStatus, lastUpdated: new Date().toISOString() }
          : app
      )
    );
    setDraggedCard(null);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">📋 Applications</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
          {(["all", "7days", "30days"] as TimeFilter[]).map((filter) => (
            <FilterButton
              key={filter}
              active={timeFilter === filter}
              onClick={() => setTimeFilter(filter)}
            >
              {filter === "all" ? "All Time" : filter === "7days" ? "Last 7 Days" : "Last 30 Days"}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={Target}
          label="Total Applications"
          value={stats.total}
          color="var(--color-cyan)"
        />
        <StatCard
          icon={TrendingUp}
          label="Response Rate"
          value={`${stats.responseRate}%`}
          color="var(--color-amber)"
        />
        <StatCard
          icon={Users}
          label="Interviews"
          value={stats.interviews}
          color="var(--color-indigo)"
        />
        <StatCard
          icon={Gift}
          label="Offers"
          value={stats.offers}
          color="var(--color-emerald)"
        />
      </div>

      {/* Kanban Board */}
      <div className="grid gap-4 lg:grid-cols-5">
        {columns.map((col) => {
          const colApps = filteredApplications.filter((a) => a.status === col.status);
          return (
            <KanbanColumn
              key={col.status}
              column={col}
              applications={colApps}
              onDragStart={(id) => setDraggedCard(id)}
              onDragEnd={handleDragEnd}
              isDragging={draggedCard !== null}
              draggedCard={draggedCard}
            />
          );
        })}
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  applications,
  onDragStart,
  onDragEnd,
  isDragging,
  draggedCard,
}: {
  column: KanbanColumn;
  applications: Application[];
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, status: KanbanStatus) => void;
  isDragging: boolean;
  draggedCard: string | null;
}) {
  const Icon = column.icon;

  return (
    <motion.div
      className="flex flex-col"
      animate={{
        scale: isDragging && draggedCard && !applications.find((a) => a.id === draggedCard) ? 1.01 : 1,
      }}
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ backgroundColor: `color-mix(in srgb, ${column.color} 20%, transparent)` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: column.color }} />
        </div>
        <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
          {column.label}
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `color-mix(in srgb, ${column.color} 15%, transparent)`,
            color: column.color,
          }}
        >
          {applications.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        className="min-h-[400px] flex-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/50 p-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (draggedCard) {
            onDragEnd(draggedCard, column.status);
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {applications.map((app, idx) => (
            <ApplicationCard
              key={app.id}
              application={app}
              column={column}
              index={idx}
              onDragStart={onDragStart}
            />
          ))}
        </AnimatePresence>

        {applications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-32 items-center justify-center rounded-lg border border-dashed border-[var(--color-border-default)] text-xs text-[var(--color-text-muted)]"
          >
            Drop applications here
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function ApplicationCard({
  application,
  column,
  index,
  onDragStart,
}: {
  application: Application;
  column: KanbanColumn;
  index: number;
  onDragStart: (id: string) => void;
}) {
  const dragControls = useDragControls();
  const firstLetter = application.job.company.charAt(0).toUpperCase();
  const bgColor = companyColors[firstLetter] || "#6366F1";
  const score = application.job.scores.composite;
  const scoreColor =
    score >= 85 ? "var(--color-emerald)" : score >= 70 ? "var(--color-amber)" : "var(--color-text-muted)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragElastic={0.1}
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      onDragStart={() => onDragStart(application.id)}
      whileDrag={{
        scale: 1.05,
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        zIndex: 50,
        cursor: "grabbing",
      }}
      className="glass-card mb-2 cursor-grab p-3 transition-all hover:border-[var(--color-border-hover)] active:cursor-grabbing"
    >
      {/* Drag Handle + Company Logo */}
      <div className="flex items-start gap-2">
        <motion.div
          onPointerDown={(e) => dragControls.start(e)}
          className="mt-0.5 cursor-grab text-[var(--color-text-muted)] opacity-40 hover:opacity-100"
        >
          <GripVertical className="h-4 w-4" />
        </motion.div>

        {/* Company Logo Placeholder */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
          style={{
            backgroundColor: bgColor,
            color: bgColor === "#000000" || bgColor === "#632CA6" ? "#fff" : "#000",
          }}
        >
          {firstLetter}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {application.job.title}
          </h4>
          <p className="truncate text-xs text-[var(--color-text-muted)]">
            {application.job.company}
          </p>
        </div>
      </div>

      {/* Meta Row */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {formatDate(application.appliedAt)}
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            backgroundColor: `color-mix(in srgb, ${scoreColor} 15%, transparent)`,
            color: scoreColor,
          }}
        >
          {score}% match
        </span>
      </div>

      {/* Stage-specific action */}
      {column.action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors"
          style={{
            backgroundColor: `color-mix(in srgb, ${column.color} 12%, transparent)`,
            color: column.color,
          }}
        >
          <column.action.icon className="h-3 w-3" />
          {column.action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Target;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex items-center gap-4 p-4"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      </div>
    </motion.div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-[var(--color-indigo-border)] bg-[var(--color-indigo-bg)] text-[var(--color-indigo)]"
          : "border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
      }`}
    >
      {children}
    </button>
  );
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (86400 * 1000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
