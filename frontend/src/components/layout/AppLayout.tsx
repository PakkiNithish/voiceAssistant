"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { AgentStoreProvider } from "@/hooks/useAgentStore";
import { ToastContainer } from "@/components/ui/Toast";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AgentStoreProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50/70 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 flex h-full w-64 flex-col bg-white dark:bg-slate-950 shadow-2xl">
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col h-full overflow-hidden min-w-0">
          <TopNav onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Global Toast Notifications */}
        <ToastContainer />
      </div>
    </AgentStoreProvider>
  );
}

