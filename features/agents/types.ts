import { Search, BarChart3, PenTool, Target, Mail, LucideIcon } from "lucide-react";

export type AgentName = "scout" | "analyzer" | "writer" | "coach" | "reporter";

export interface AgentEvent {
  id: string;
  agent: AgentName;
  message: string;
  status: "completed" | "running" | "pending";
  timestamp: string;
}

export const agentMeta: Record<
  AgentName,
  { icon: LucideIcon; color: string; label: string }
> = {
  scout: { icon: Search, color: "var(--color-cyan)", label: "Scout Agent" },
  analyzer: { icon: BarChart3, color: "var(--color-amber)", label: "Analyzer Agent" },
  writer: { icon: PenTool, color: "var(--color-indigo)", label: "Writer Agent" },
  coach: { icon: Target, color: "var(--color-emerald)", label: "Coach Agent" },
  reporter: { icon: Mail, color: "var(--color-rose)", label: "Reporter Agent" },
};
