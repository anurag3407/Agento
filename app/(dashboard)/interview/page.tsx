"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Calendar,
  Building2,
  Play,
  Target,
  Brain,
  Zap,
  ChevronRight,
  Star,
  Timer,
  MessageSquare,
  FileCode,
  Users,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { mockSessions, mockWeaknesses } from "@/data/mock-interviews";
import Link from "next/link";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

type PrepMode = "oa" | "code" | "behavioral";

const modes = [
  {
    id: "oa" as PrepMode,
    label: "OA Mode",
    subtitle: "Online Assessment",
    icon: FileCode,
    desc: "Timed coding challenges with auto-grading",
    color: "var(--color-cyan)",
    features: ["45-90 min timed sessions", "Company-specific difficulty", "Auto-graded solutions"],
  },
  {
    id: "code" as PrepMode,
    label: "Code Mode",
    subtitle: "Live Coding Simulation",
    icon: Monitor,
    desc: "Real-time coding with AI interviewer feedback",
    color: "var(--color-indigo)",
    features: ["Live follow-up questions", "Code quality analysis", "Communication scoring"],
  },
  {
    id: "behavioral" as PrepMode,
    label: "Behavioral Mode",
    subtitle: "STAR Method Practice",
    icon: Mic,
    desc: "Voice-enabled STAR framework practice",
    color: "var(--color-emerald)",
    features: ["Speech analysis", "Filler word detection", "Impact quantification"],
  },
];

const upcomingInterviews = [
  {
    id: "i1",
    company: "Google",
    role: "SDE-2",
    date: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    type: "Technical",
    logo: "G",
    color: "var(--color-cyan)",
    prepFocus: ["System Design", "Dynamic Programming", "Behavioral Leadership"],
  },
  {
    id: "i2",
    company: "Stripe",
    role: "Backend Engineer",
    date: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
    type: "System Design",
    logo: "S",
    color: "var(--color-indigo)",
    prepFocus: ["API Design", "Database Scaling", "Payment Systems"],
  },
  {
    id: "i3",
    company: "Meta",
    role: "Software Engineer",
    date: new Date(Date.now() + 12 * 86400 * 1000).toISOString(),
    type: "Full Loop",
    logo: "M",
    color: "var(--color-rose)",
    prepFocus: ["Trees/Graphs", "System Design", "Behavioral"],
  },
];

const practiceQuestions: Record<PrepMode, Array<{
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  company: string;
  practiced: boolean;
  mastered: boolean;
}>> = {
  oa: [
    { id: "q1", title: "Two Sum", difficulty: "Easy", company: "Google", practiced: true, mastered: true },
    { id: "q2", title: "LRU Cache", difficulty: "Medium", company: "Meta", practiced: true, mastered: false },
    { id: "q3", title: "Merge K Sorted Lists", difficulty: "Hard", company: "Google", practiced: false, mastered: false },
    { id: "q4", title: "Valid Parentheses", difficulty: "Easy", company: "Stripe", practiced: true, mastered: true },
    { id: "q5", title: "Word Break", difficulty: "Medium", company: "Meta", practiced: false, mastered: false },
    { id: "q6", title: "Median of Two Sorted Arrays", difficulty: "Hard", company: "Google", practiced: false, mastered: false },
  ],
  code: [
    { id: "q7", title: "Design a Rate Limiter", difficulty: "Medium", company: "Stripe", practiced: true, mastered: false },
    { id: "q8", title: "Implement a Thread Pool", difficulty: "Hard", company: "Google", practiced: false, mastered: false },
    { id: "q9", title: "Build a URL Shortener", difficulty: "Medium", company: "Meta", practiced: true, mastered: true },
    { id: "q10", title: "Design a Cache System", difficulty: "Medium", company: "Stripe", practiced: false, mastered: false },
  ],
  behavioral: [
    { id: "q11", title: "Tell me about a time you led a project", difficulty: "Medium", company: "Google", practiced: true, mastered: false },
    { id: "q12", title: "Describe a conflict with a teammate", difficulty: "Medium", company: "Meta", practiced: true, mastered: true },
    { id: "q13", title: "How do you handle tight deadlines?", difficulty: "Easy", company: "Stripe", practiced: false, mastered: false },
    { id: "q14", title: "Tell me about a failure", difficulty: "Hard", company: "Google", practiced: false, mastered: false },
  ],
};

export default function InterviewPage() {
  const [selectedInterview, setSelectedInterview] = useState(upcomingInterviews[0]);
  const [selectedMode, setSelectedMode] = useState<PrepMode>("oa");
  const [isPracticing, setIsPracticing] = useState(false);

  const totalSessions = mockSessions.length + 11;
  const questionsPracticed = 47;
  const topicsMastered = 8;
  const weaknessesIdentified = mockWeaknesses.length;

  const currentQuestions = practiceQuestions[selectedMode];
  const practicedCount = currentQuestions.filter(q => q.practiced).length;
  const masteredCount = currentQuestions.filter(q => q.mastered).length;

  const getDaysUntil = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return days === 1 ? "Tomorrow" : `${days} days`;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "var(--color-emerald)";
      case "Medium": return "var(--color-amber)";
      case "Hard": return "var(--color-rose)";
      default: return "var(--color-text-muted)";
    }
  };

  if (isPracticing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto flex max-w-2xl flex-col items-center justify-center py-20 text-center"
      >
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `color-mix(in srgb, ${modes.find(m => m.id === selectedMode)?.color} 15%, transparent)` }}
        >
          {selectedMode === "oa" && <FileCode className="h-10 w-10" style={{ color: modes.find(m => m.id === selectedMode)?.color }} />}
          {selectedMode === "code" && <Monitor className="h-10 w-10" style={{ color: modes.find(m => m.id === selectedMode)?.color }} />}
          {selectedMode === "behavioral" && <Mic className="h-10 w-10" style={{ color: modes.find(m => m.id === selectedMode)?.color }} />}
        </div>
        <h1 className="text-2xl font-bold">{modes.find(m => m.id === selectedMode)?.label}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Preparing for: {selectedInterview.role} @ {selectedInterview.company}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Focus areas: {selectedInterview.prepFocus.join(", ")}
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/interview/session">
            <button
              className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
              style={{ backgroundColor: modes.find(m => m.id === selectedMode)?.color }}
            >
              <Play className="h-4 w-4" /> Begin Session
            </button>
          </Link>
          <button
            onClick={() => setIsPracticing(false)}
            className="rounded-xl border border-[var(--color-border-default)] px-6 py-3.5 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-bg-card)]"
          >
            Back to Prep
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-6">
        <h1 className="text-2xl font-bold">🎯 Interview Prep Hub</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Company-specific preparation for your upcoming interviews
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={item} className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Questions Practiced", value: questionsPracticed, icon: Target, color: "var(--color-indigo)" },
          { label: "Topics Mastered", value: topicsMastered, icon: Star, color: "var(--color-emerald)" },
          { label: "Weaknesses Identified", value: weaknessesIdentified, icon: AlertTriangle, color: "var(--color-amber)" },
          { label: "Sessions Completed", value: totalSessions, icon: BarChart3, color: "var(--color-cyan)" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card flex items-center gap-3 p-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left Sidebar - Upcoming Interviews */}
        <motion.div variants={item} className="space-y-4">
          <div className="glass-card p-4">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-[var(--color-indigo)]" />
              Upcoming Interviews
            </h2>
            <div className="space-y-2">
              {upcomingInterviews.map((interview) => (
                <motion.button
                  key={interview.id}
                  onClick={() => setSelectedInterview(interview)}
                  className={`w-full rounded-lg p-3 text-left transition-all ${
                    selectedInterview.id === interview.id
                      ? "border border-[var(--color-indigo-border)] bg-[var(--color-indigo-bg)]"
                      : "border border-transparent hover:bg-[var(--color-bg-card)]"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: interview.color }}
                    >
                      {interview.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {interview.company}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">
                        {interview.role}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-medium text-[var(--color-amber)]">
                          {getDaysUntil(interview.date)}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          • {interview.type}
                        </span>
                      </div>
                    </div>
                    {selectedInterview.id === interview.id && (
                      <ChevronRight className="h-4 w-4 text-[var(--color-indigo)]" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Weakness Areas */}
          <div className="glass-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-[var(--color-amber)]" />
              Weakness Areas
            </h2>
            <div className="space-y-2">
              {mockWeaknesses.map((w) => (
                <div
                  key={w.topic}
                  className="flex items-center justify-between rounded-lg bg-[var(--color-amber-bg)] px-3 py-2"
                >
                  <span className="text-xs font-medium text-[var(--color-amber)]">
                    {w.topic}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[var(--color-amber)]">
                    <TrendingUp className="h-3 w-3" />
                    +{w.improvementDelta}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="space-y-5">
          {/* Company Context */}
          <motion.div variants={item} className="glass-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white"
                  style={{ backgroundColor: selectedInterview.color }}
                >
                  {selectedInterview.logo}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {selectedInterview.company} — {selectedInterview.role}
                  </h2>
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                    {selectedInterview.type} Interview • {getDaysUntil(selectedInterview.date)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPracticing(true)}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-indigo)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/20"
              >
                <Play className="h-4 w-4" /> Start Practice Session
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedInterview.prepFocus.map((focus) => (
                <span
                  key={focus}
                  className="rounded-full bg-[var(--color-bg-card)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  {focus}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Mode Selection */}
          <motion.div variants={item} className="grid gap-4 md:grid-cols-3">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              return (
                <motion.button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`glass-card p-4 text-left transition-all ${
                    isSelected
                      ? "border-[var(--color-indigo-border)] shadow-lg shadow-[var(--color-indigo)]/5"
                      : "hover:border-[var(--color-border-hover)]"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${mode.color} 15%, transparent)`,
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: mode.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {mode.label}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {mode.subtitle}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="ml-auto">
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-indigo)]" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Practice Questions */}
          <motion.div variants={item} className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Brain className="h-5 w-5 text-[var(--color-indigo)]" />
                  Practice Questions
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {modes.find(m => m.id === selectedMode)?.desc}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                  <Target className="h-3.5 w-3.5" /> {practicedCount}/{currentQuestions.length} practiced
                </span>
                <span className="flex items-center gap-1 text-[var(--color-emerald)]">
                  <Star className="h-3.5 w-3.5" /> {masteredCount} mastered
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--color-bg-input)]">
              <div className="flex h-full">
                <div
                  className="h-full bg-[var(--color-emerald)] transition-all"
                  style={{ width: `${(masteredCount / currentQuestions.length) * 100}%` }}
                />
                <div
                  className="h-full bg-[var(--color-indigo)] transition-all"
                  style={{ width: `${((practicedCount - masteredCount) / currentQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {currentQuestions.map((question, idx) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] p-3 transition-all hover:bg-[var(--color-bg-card-hover)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        question.mastered
                          ? "bg-[var(--color-emerald-bg)]"
                          : question.practiced
                            ? "bg-[var(--color-indigo-bg)]"
                            : "bg-[var(--color-bg-input)]"
                      }`}>
                        {question.mastered ? (
                          <Star className="h-4 w-4 text-[var(--color-emerald)]" />
                        ) : question.practiced ? (
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-indigo)]" />
                        ) : (
                          <span className="text-xs font-medium text-[var(--color-text-muted)]">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {question.title}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          {question.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${getDifficultyColor(question.difficulty)} 15%, transparent)`,
                          color: getDifficultyColor(question.difficulty),
                        }}
                      >
                        {question.difficulty}
                      </span>
                      <Link href="/interview/session">
                        <button className="rounded-lg border border-[var(--color-border-default)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-indigo)] hover:text-[var(--color-indigo)]">
                          Practice
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mode Features + Recent Sessions */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Mode Features */}
            <motion.div variants={item} className="glass-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" style={{ color: modes.find(m => m.id === selectedMode)?.color }} />
                {modes.find(m => m.id === selectedMode)?.label} Features
              </h3>
              <div className="space-y-2">
                {modes.find(m => m.id === selectedMode)?.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg bg-[var(--color-bg-card)] px-3 py-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    <CheckCircle2 className="h-4 w-4" style={{ color: modes.find(m => m.id === selectedMode)?.color }} />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div variants={item} className="glass-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
                Recent Sessions
              </h3>
              <div className="space-y-2">
                {mockSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg bg-[var(--color-bg-card)] p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {session.company}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {session.sessionType.toUpperCase()} • {getTimeAgo(session.completedAt)}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        session.scores.overall >= 80
                          ? "text-[var(--color-emerald)]"
                          : session.scores.overall >= 60
                            ? "text-[var(--color-amber)]"
                            : "text-[var(--color-rose)]"
                      }`}
                    >
                      {session.scores.overall}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
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
