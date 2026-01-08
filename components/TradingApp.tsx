"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Accounts from "./pages/Accounts";
import GettingStarted from "./pages/GettingStarted";

export interface WhopUser {
  id: string;
  username: string;
  name: string;
  accessLevel: string;
}

interface TradingAppProps {
  whopUser: WhopUser;
  experienceId: string;
}

type Page = "getting-started" | "dashboard" | "leaderboard" | "accounts";

export default function TradingApp({ whopUser, experienceId }: TradingAppProps) {
  const [currentPage, setCurrentPage] = useState<Page>("getting-started");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "getting-started":
        return <GettingStarted whopUser={whopUser} />;
      case "dashboard":
        return <Dashboard whopUser={whopUser} />;
      case "leaderboard":
        return <Leaderboard />;
      case "accounts":
        return <Accounts whopUser={whopUser} />;
      default:
        return <GettingStarted whopUser={whopUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        whopUser={whopUser}
      />

      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-[280px]"
        }`}
      >
        <div className="p-4 md:p-8">{renderPage()}</div>
      </main>

      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-3 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  );
}
