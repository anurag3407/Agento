"use client";

import { StoreProvider, useInitializeStore } from "@/lib/store";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AgentFooter from "@/components/layout/agent-footer";

function DashboardShell({ children }: { children: React.ReactNode }) {
  useInitializeStore();

  return (
    <div className="relative z-10 flex">
      <Sidebar />
      <div className="flex-1 w-full pl-[260px] transition-all duration-300">
        <Header />
        <main className="min-h-[calc(100vh-104px)] px-6 py-6 pb-14 mt-4">
          {children}
        </main>
        <AgentFooter />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div className="relative min-h-screen bg-[var(--color-bg-primary)] overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-indigo)]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-amber)]/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-[var(--color-rose)]/5 blur-[120px] pointer-events-none" />

        <DashboardShell>{children}</DashboardShell>
      </div>
    </StoreProvider>
  );
}
