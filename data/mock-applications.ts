import type { Application } from "@/types/application";
import { mockJobs } from "./mock-jobs";

export const mockApplications: Application[] = [
  // Discovered
  {
    id: "a5",
    jobId: "j6",
    job: mockJobs[5],
    resumeVariantId: "r2",
    status: "discovered",
    appliedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "a6",
    jobId: "j4",
    job: mockJobs[3],
    resumeVariantId: "r1",
    status: "discovered",
    appliedAt: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
  },
  // Applied
  {
    id: "a2",
    jobId: "j2",
    job: mockJobs[1],
    resumeVariantId: "r2",
    status: "applied",
    appliedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
  {
    id: "a7",
    jobId: "j5",
    job: mockJobs[4],
    resumeVariantId: "r1",
    status: "applied",
    appliedAt: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 4 * 86400 * 1000).toISOString(),
  },
  // Screening
  {
    id: "a1",
    jobId: "j1",
    job: mockJobs[0],
    resumeVariantId: "r1",
    status: "screening",
    appliedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
  },
  // Interviewing
  {
    id: "a3",
    jobId: "j3",
    job: mockJobs[2],
    resumeVariantId: "r3",
    status: "interviewing",
    appliedAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 86400 * 1000).toISOString(),
  },
  // Offered
  {
    id: "a8",
    jobId: "j4",
    job: {
      ...mockJobs[3],
      id: "j7",
      title: "Staff Engineer",
      company: "Figma",
      salary: "$200-250K",
      scores: { skills: 91, culture: 89, trajectory: 95, composite: 92 },
    },
    resumeVariantId: "r1",
    status: "offered",
    appliedAt: new Date(Date.now() - 21 * 86400 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
  // Rejected (hidden from kanban)
  {
    id: "a4",
    jobId: "j5",
    job: mockJobs[4],
    resumeVariantId: "r1",
    status: "rejected",
    rejectionReason: "Role mismatch — looking for senior-level candidate",
    appliedAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
  },
];
