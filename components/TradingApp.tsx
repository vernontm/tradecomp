"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Accounts from "./pages/Accounts";
import GettingStarted from "./pages/GettingStarted";
import AdminPanel from "./pages/AdminPanel";
import AdminUsers from "./pages/AdminUsers";
import AdminCronLogs from "./pages/AdminCronLogs";

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

type Page = "getting-started" | "dashboard" | "leaderboard" | "accounts" | "admin" | "admin-users" | "admin-logs";

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
      case "admin":
        return whopUser.accessLevel === "admin" ? (
          <AdminPanel whopUser={whopUser} />
        ) : (
          <GettingStarted whopUser={whopUser} />
        );
      case "admin-users":
        return whopUser.accessLevel === "admin" ? (
          <AdminUsers whopUser={whopUser} />
        ) : (
          <GettingStarted whopUser={whopUser} />
        );
      case "admin-logs":
        return whopUser.accessLevel === "admin" ? (
          <AdminCronLogs whopUser={whopUser} />
        ) : (
          <GettingStarted whopUser={whopUser} />
        );
      default:
        return <GettingStarted whopUser={whopUser} />;
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black whop-embed">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
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
        className={`transition-all duration-300 min-h-screen min-h-[100dvh] ${
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        }`}
      >
        <div className="p-3 md:p-6">{renderPage()}</div>
      </main>

      <button
        className="md:hidden fixed top-3 left-3 z-50 bg-card border border-border text-white p-2.5 rounded-xl shadow-lg hover:bg-border transition-colors"
        onClick={() => setMobileOpen(true)}
      >
        <svg
          className="w-5 h-5"
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
