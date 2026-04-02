import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AgentFooter from "@/components/layout/agent-footer";
import { AgentProvider } from "@/features/agents/context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgentProvider>
      <Sidebar />
      <div className="pl-[240px] transition-all duration-300">
        <Header />
        <main className="min-h-[calc(100vh-104px)] px-6 py-6 pb-14">
          {children}
        </main>
        <AgentFooter />
      </div>
    </AgentProvider>
  );
}
