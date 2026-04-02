"use client";

/**
 * Quick Apply Component
 * ====================
 * Allows users to paste a job URL for instant AI analysis.
 * This triggers the full agent pipeline for a single job.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  Target,
  X,
} from "lucide-react";

interface QuickApplyProps {
  userId: string;
  onAnalysisComplete?: (result: QuickAnalysisResult) => void;
}

interface QuickAnalysisResult {
  jobId: string;
  title: string;
  company: string;
  scores: {
    skills: number;
    culture: number;
    trajectory: number;
    composite: number;
  };
  aiReasoning: string;
  resumeReady: boolean;
  coverLetterReady: boolean;
}

type AnalysisStage =
  | "idle"
  | "extracting"
  | "analyzing"
  | "scoring"
  | "generating"
  | "complete"
  | "error";

const stageMessages: Record<AnalysisStage, string> = {
  idle: "",
  extracting: "Extracting job details...",
  analyzing: "Analyzing requirements...",
  scoring: "Calculating match scores...",
  generating: "Generating tailored resume...",
  complete: "Analysis complete!",
  error: "Something went wrong",
};

export function QuickApply({ userId, onAnalysisComplete }: QuickApplyProps) {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<AnalysisStage>("idle");
  const [result, setResult] = useState<QuickAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!url || !isValidUrl(url)) {
      setError("Please enter a valid URL");
      return;
    }

    setError(null);
    setResult(null);

    // Simulate the analysis stages
    // In production, this would call the actual API
    try {
      setStage("extracting");
      await new Promise((r) => setTimeout(r, 1500));

      setStage("analyzing");
      await new Promise((r) => setTimeout(r, 2000));

      setStage("scoring");
      await new Promise((r) => setTimeout(r, 1500));

      setStage("generating");
      await new Promise((r) => setTimeout(r, 2500));

      // Mock result
      const mockResult: QuickAnalysisResult = {
        jobId: `job-${Date.now()}`,
        title: "Senior Software Engineer",
        company: extractCompanyFromUrl(url),
        scores: {
          skills: 92,
          culture: 87,
          trajectory: 94,
          composite: 91,
        },
        aiReasoning:
          "This role matches 9 of your 11 listed skills, the company's engineering blog suggests they value distributed systems work, and it was posted recently.",
        resumeReady: true,
        coverLetterReady: true,
      };

      setResult(mockResult);
      setStage("complete");
      onAnalysisComplete?.(mockResult);
    } catch (e) {
      setStage("error");
      setError(e instanceof Error ? e.message : "Analysis failed");
    }
  }, [url, onAnalysisComplete]);

  const handleReset = () => {
    setUrl("");
    setStage("idle");
    setResult(null);
    setError(null);
  };

  const isProcessing = !["idle", "complete", "error"].includes(stage);

  return (
    <div className="glass-card overflow-hidden">
      {/* Input Section */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-indigo-bg)]">
            <Zap className="h-5 w-5 text-[var(--color-indigo)]" />
          </div>

          <div className="flex flex-1 items-center gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a job URL for instant analysis..."
              disabled={isProcessing}
              className="h-11 flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-colors focus:border-[var(--color-indigo)] focus:outline-none disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isProcessing) {
                  handleSubmit();
                }
              }}
            />

            {stage === "complete" ? (
              <button
                onClick={handleReset}
                className="flex h-11 items-center gap-2 rounded-lg border border-[var(--color-border-default)] px-4 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!url || isProcessing}
                className="flex h-11 items-center gap-2 rounded-lg bg-[var(--color-indigo)] px-5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)] hover:shadow-lg hover:shadow-[var(--color-indigo)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {isProcessing ? "Analyzing..." : "Go"}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-xs text-[var(--color-rose)]"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </div>

      {/* Progress Section */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-card)]/50"
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full border-2 border-[var(--color-indigo)] border-t-transparent animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {stageMessages[stage]}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    This usually takes about 30 seconds
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mt-4 flex items-center gap-2">
                {(["extracting", "analyzing", "scoring", "generating"] as const).map(
                  (s, i) => {
                    const stageIndex = [
                      "extracting",
                      "analyzing",
                      "scoring",
                      "generating",
                    ].indexOf(stage);
                    const isComplete = i < stageIndex;
                    const isCurrent = s === stage;

                    return (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full transition-colors ${
                            isComplete
                              ? "bg-[var(--color-emerald)]"
                              : isCurrent
                                ? "bg-[var(--color-indigo)] animate-pulse"
                                : "bg-[var(--color-border-default)]"
                          }`}
                        />
                        {i < 3 && (
                          <div
                            className={`h-0.5 w-8 transition-colors ${
                              isComplete
                                ? "bg-[var(--color-emerald)]"
                                : "bg-[var(--color-border-default)]"
                            }`}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Section */}
      <AnimatePresence>
        {stage === "complete" && result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--color-border-default)]"
          >
            <div className="p-4">
              {/* Job Info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[var(--color-emerald)]" />
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {result.title}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {result.company}
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--color-emerald)] bg-[var(--color-emerald-bg)]">
                  <span className="text-lg font-bold text-[var(--color-emerald)]">
                    {result.scores.composite}%
                  </span>
                </div>
              </div>

              {/* Scores */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Skills", score: result.scores.skills },
                  { label: "Culture", score: result.scores.culture },
                  { label: "Trajectory", score: result.scores.trajectory },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg bg-[var(--color-bg-card)] p-2.5 text-center"
                  >
                    <p className="text-lg font-bold text-[var(--color-text-primary)]">
                      {item.score}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI Reasoning */}
              <p className="mt-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                &ldquo;{result.aiReasoning}&rdquo;
              </p>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                {result.resumeReady && (
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-indigo)] px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)]">
                    <FileText className="h-3.5 w-3.5" />
                    View Resume
                  </button>
                )}
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-border-default)] px-3 py-2.5 text-xs font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]">
                  <Target className="h-3.5 w-3.5" />
                  Mock Interview
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-default)] text-[var(--color-text-muted)] transition-all hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to extract company name from URL
function extractCompanyFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Extract company name from common patterns
    const patterns = [
      /jobs\.(.+)\.com/,
      /careers\.(.+)\.com/,
      /(.+)\.greenhouse\.io/,
      /(.+)\.lever\.co/,
      /boards\.(.+)\.com/,
    ];

    for (const pattern of patterns) {
      const match = hostname.match(pattern);
      if (match) {
        return match[1].charAt(0).toUpperCase() + match[1].slice(1);
      }
    }

    // Fallback: use domain name
    const parts = hostname.replace("www.", "").split(".");
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return "Company";
  }
}
