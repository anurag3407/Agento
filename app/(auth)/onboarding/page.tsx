"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Rocket,
  Upload,
  Linkedin,
  Keyboard,
  Target,
  MapPin,
  Github,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

const steps = [
  { id: 1, label: "Welcome", icon: Rocket },
  { id: 2, label: "Profile", icon: Upload },
  { id: 3, label: "Skills", icon: Keyboard },
  { id: 4, label: "Goals", icon: Target },
  { id: 5, label: "Preferences", icon: MapPin },
  { id: 6, label: "GitHub", icon: Github },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] dot-pattern">
      <div className="w-full max-w-2xl px-6 py-10">
        {/* Progress bar */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  s.id < step
                    ? "bg-[var(--color-emerald)] text-white"
                    : s.id === step
                      ? "bg-[var(--color-indigo)] text-white glow-indigo"
                      : "border border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)]"
                }`}
              >
                {s.id < step ? <Check className="h-4 w-4" /> : s.id}
              </div>
              {s.id < steps.length && (
                <div
                  className={`h-0.5 w-8 rounded-full transition-colors ${
                    s.id < step
                      ? "bg-[var(--color-emerald)]"
                      : "bg-[var(--color-border-default)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card mx-auto max-w-lg p-8"
          >
            {step === 1 && <StepWelcome />}
            {step === 2 && <StepProfile />}
            {step === 3 && <StepSkills />}
            {step === 4 && <StepGoals />}
            {step === 5 && <StepPreferences />}
            {step === 6 && <StepGithub />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-indigo)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-indigo-hover)]"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <Link href="/dashboard">
              <button className="flex items-center gap-2 rounded-xl bg-[var(--color-emerald)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-emerald-hover)]">
                <Rocket className="h-4 w-4" /> Launch CareerPilot
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function StepWelcome() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-indigo-bg)]">
        <Rocket className="h-7 w-7 text-[var(--color-indigo)]" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
        Welcome to CareerPilot
      </h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Let&apos;s set up your profile so our AI agents can start finding
        the perfect opportunities for you.
      </p>
      <div className="mt-6 space-y-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">
          What brings you here?
        </p>
        {[
          "Active job hunting",
          "Passive exploring",
          "Interview prep only",
        ].map((opt) => (
          <button
            key={opt}
            className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] transition-all hover:border-[var(--color-indigo-border)] hover:bg-[var(--color-indigo-bg)]"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepProfile() {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
        Import Your Profile
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        We&apos;ll extract your experience, skills, and education automatically.
      </p>
      <div className="mt-6 space-y-3">
        <button className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-5 text-sm transition-all hover:border-[var(--color-indigo)]">
          <Upload className="h-5 w-5 text-[var(--color-indigo)]" />
          <div className="text-left">
            <p className="font-medium text-[var(--color-text-primary)]">
              Upload Resume (PDF)
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              AI will extract all your data automatically
            </p>
          </div>
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-5 text-sm transition-all hover:border-[var(--color-border-hover)]">
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          <div className="text-left">
            <p className="font-medium text-[var(--color-text-primary)]">
              Import from LinkedIn
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Paste your LinkedIn URL
            </p>
          </div>
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-5 text-sm transition-all hover:border-[var(--color-border-hover)]">
          <Keyboard className="h-5 w-5 text-[var(--color-text-muted)]" />
          <div className="text-left">
            <p className="font-medium text-[var(--color-text-primary)]">
              Manual Entry
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Fill in your details step by step
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

function StepSkills() {
  const suggestedSkills = [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Redis",
    "GraphQL",
  ];
  const [selected, setSelected] = useState<string[]>([
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
        Skills Assessment
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Select your skills and rate your proficiency.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {suggestedSkills.map((skill) => {
          const isSelected = selected.includes(skill);
          return (
            <button
              key={skill}
              onClick={() =>
                setSelected(
                  isSelected
                    ? selected.filter((s) => s !== skill)
                    : [...selected, skill]
                )
              }
              className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? "border-[var(--color-indigo-border)] bg-[var(--color-indigo-bg)] text-[var(--color-indigo)]"
                  : "border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
              }`}
            >
              {isSelected ? (
                <X className="h-3 w-3" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              {skill}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">
        💡 You listed React — do you also know Redux, React Native, or Remix?
      </p>
    </div>
  );
}

function StepGoals() {
  const goals = [
    "Senior Engineer at a top tech company",
    "Tech Lead / Engineering Manager",
    "Founding Engineer at a startup",
    "Specialized role (ML, Security, DevOps)",
    "Custom goal",
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
        Career Vision
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Where do you want to be in 3 years?
      </p>
      <div className="mt-5 space-y-2">
        {goals.map((goal) => (
          <button
            key={goal}
            className="w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-4 py-3 text-left text-sm text-[var(--color-text-primary)] transition-all hover:border-[var(--color-indigo-border)] hover:bg-[var(--color-indigo-bg)]"
          >
            {goal}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPreferences() {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
        Job Preferences
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Help our agents find the right opportunities.
      </p>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-[var(--color-text-secondary)]">
            Work Mode
          </label>
          <div className="flex gap-2">
            {["Remote", "Hybrid", "On-site", "Any"].map((mode) => (
              <button
                key={mode}
                className="flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] py-2 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-indigo-border)] hover:bg-[var(--color-indigo-bg)] hover:text-[var(--color-indigo)]"
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-[var(--color-text-secondary)]">
            Company Size
          </label>
          <div className="flex gap-2">
            {["Startup (<50)", "Mid (50-500)", "Large (500+)", "Any"].map(
              (size) => (
                <button
                  key={size}
                  className="flex-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] py-2 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-indigo-border)]"
                >
                  {size}
                </button>
              )
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
              Min Salary
            </label>
            <input
              type="text"
              placeholder="$120,000"
              className="h-10 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-indigo)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
              Max Salary
            </label>
            <input
              type="text"
              placeholder="$220,000"
              className="h-10 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-indigo)] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepGithub() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-bg-card)]">
        <Github className="h-7 w-7 text-[var(--color-text-primary)]" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
        Connect GitHub
      </h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        We&apos;ll analyze your top languages, contribution frequency, and
        notable repos to strengthen your profile.
      </p>
      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-4 py-3.5 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-border-hover)]">
        <Github className="h-5 w-5" /> Connect GitHub Account
      </button>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">
        This step is optional. You can always connect later.
      </p>
    </div>
  );
}
