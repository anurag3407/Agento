"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Rocket,
  Zap,
  Target,
  Brain,
  FileText,
  Mic,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Play,
  Sparkles,
  Search,
  Shield,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Component as HeroSection } from "@/components/ui/horizon-hero-section";

const features = [
  {
    icon: Search,
    title: "Scout Agent",
    description: "Monitors 10+ job boards 24/7, flagging fresh opportunities before the competition.",
    color: "orange",
  },
  {
    icon: Target,
    title: "Analyzer Agent",
    description: "Scores every job on skills fit, culture match, and career trajectory alignment.",
    color: "amber",
  },
  {
    icon: FileText,
    title: "Writer Agent",
    description: "Generates unique, ATS-optimized resumes tailored to each specific role.",
    color: "emerald",
  },
  {
    icon: Mic,
    title: "Coach Agent",
    description: "Simulates real interviews with voice analysis and personalized feedback.",
    color: "cyan",
  },
  {
    icon: BarChart3,
    title: "Reporter Agent",
    description: "Delivers daily intelligence briefings with actionable insights.",
    color: "rose",
  },
];

const stats = [
  { value: "10+", label: "Job Sources" },
  { value: "24/7", label: "Autonomous Hunting" },
  { value: "73%", label: "Applications Lost" },
  { value: "5", label: "AI Agents" },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="relative bg-[var(--color-bg-primary)]">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-orange)] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-[var(--color-orange)] to-[var(--color-orange-intense)] flex items-center justify-center shadow-lg">
                <Rocket className="h-6 w-6 text-white transform -rotate-45" />
              </div>
            </div>
            <span className="text-xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
              CareerPilot
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-orange)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-orange)] transition-colors">
              How it Works
            </a>
            <a href="#agents" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-orange)] transition-colors">
              The Agents
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-orange)] transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-xl">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Three.js Hero Section */}
      <HeroSection />

      {/* Problem Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
              Job Hunting is <span className="text-[var(--color-rose)]">Broken</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              The average job seeker spends 11+ hours per week on repetitive tasks.
              73% of applications vanish into a black hole.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "11+ Hours/Week",
                description: "Wasted on repetitive searching, applying, and tracking",
              },
              {
                icon: Users,
                title: "250+ Applicants",
                description: "Average competition per job posting online",
              },
              {
                icon: TrendingUp,
                title: "3% Response Rate",
                description: "Most applications never get a human review",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="glass-card p-8 text-center hover:glow-orange transition-all duration-500"
              >
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--color-rose-bg)] flex items-center justify-center mb-5">
                  <item.icon className="h-7 w-7 text-[var(--color-rose)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
              <span className="text-[var(--color-text-primary)]">Meet Your </span>
              <span className="gradient-text-fire">AI Team</span>
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Five specialized agents that never sleep, learn from every outcome,
              and continuously improve your job search strategy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`glass-card p-8 group hover:border-[var(--color-${feature.color})] transition-all duration-500 hover:glow-orange`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-[var(--color-${feature.color}-bg)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-7 w-7 text-[var(--color-${feature.color})]`} />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}

            {/* The Loop Card - Special */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="glass-card p-8 md:col-span-2 lg:col-span-1 relative overflow-hidden gradient-border"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-orange)]/20 to-transparent blur-2xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-orange)] to-[var(--color-amber)] flex items-center justify-center mb-6">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                  The Feedback Loop
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Every rejection teaches. Every callback reinforces. Your agents evolve with real data from your journey.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-orange-bg)] to-transparent" />

        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
              <span className="text-[var(--color-text-primary)]">How </span>
              <span className="gradient-text-fire">It Works</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-orange)]/30 to-transparent" />

            <div className="grid lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Set Up Profile", desc: "Upload resume, add skills, define your dream role and preferences." },
                { step: "02", title: "Agents Activate", desc: "Your AI team starts scanning, analyzing, and preparing materials 24/7." },
                { step: "03", title: "Review Matches", desc: "Get daily briefings with top opportunities scored and explained." },
                { step: "04", title: "Land Interviews", desc: "Apply with tailored materials and prep with AI coaching simulations." },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative text-center lg:text-left"
                >
                  <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-orange)]/30 mb-6">
                    <span className="text-2xl font-bold gradient-text-fire font-[family-name:var(--font-display)]">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
            className="relative glass-card p-12 sm:p-16 text-center overflow-hidden glow-orange"
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange)]/10 via-transparent to-[var(--color-amber)]/5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-orange)]/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-orange)] to-[var(--color-orange-intense)] mb-8 shadow-2xl shadow-[var(--color-orange)]/30">
                <Zap className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-6 font-[family-name:var(--font-display)]">
                Ready to Let AI Hunt
                <br />
                <span className="gradient-text-fire">While You Sleep?</span>
              </h2>

              <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-xl mx-auto">
                Join thousands of job seekers who&apos;ve automated their search
                and landed roles at top companies.
              </p>

              <Link href="/login">
                <button className="group btn-primary px-10 py-5 text-lg font-semibold rounded-2xl inline-flex items-center gap-3">
                  Get Started — It&apos;s Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <p className="mt-6 text-sm text-[var(--color-text-muted)] flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                No credit card required • Free tier available
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-[var(--color-border-default)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-orange)] to-[var(--color-orange-intense)] flex items-center justify-center">
              <Rocket className="h-5 w-5 text-white transform -rotate-45" />
            </div>
            <span className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
              CareerPilot
            </span>
          </div>

          <p className="text-sm text-[var(--color-text-muted)]">
            © 2026 CareerPilot. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-orange)] transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-orange)] transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-orange)] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
