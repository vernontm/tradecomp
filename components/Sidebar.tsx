"use client";

import { WhopUser } from "./TradingApp";
import {
  LayoutDashboard,
  Trophy,
  Wallet,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  currentPage: string;
  onNavigate: (page: "getting-started" | "dashboard" | "leaderboard" | "accounts") => void;
  whopUser: WhopUser;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  currentPage,
  onNavigate,
  whopUser,
}: SidebarProps) {
  const navItems = [
    { id: "getting-started" as const, icon: BookOpen, label: "Getting Started" },
    { id: "dashboard" as const, icon: LayoutDashboard, label: "Dashboard" },
    { id: "leaderboard" as const, icon: Trophy, label: "Leaderboard" },
    { id: "accounts" as const, icon: Wallet, label: "My Account" },
  ];

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen h-[100dvh] bg-sidebar border-r border-border transition-all duration-300 z-50 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <button
          onClick={onToggle}
          className="hidden md:flex absolute top-5 -right-3 w-6 h-6 bg-card border border-border rounded-full items-center justify-center text-muted hover:text-white hover:border-primary transition-all z-10"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <button
          onClick={onMobileClose}
          className="md:hidden absolute top-3 right-3 text-muted hover:text-white p-1"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center min-h-[60px] border-b border-border px-4 relative">
            {!collapsed ? (
              <h1 className="text-lg font-bold text-gradient-primary">
                TRADING COMP
              </h1>
            ) : (
              <TrendingUp className="text-primary" size={24} />
            )}
          </div>

          <nav className="flex-1 py-3 overflow-y-auto scrollbar-hide">
            <div className="space-y-1 px-2">
              {!collapsed && (
                <div className="px-2 mb-3">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                    Competition
                  </p>
                </div>
              )}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/15 text-white"
                        : "text-muted hover:bg-card hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon size={18} className={`flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {!collapsed && (
                      <span className="text-sm whitespace-nowrap">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2.5 p-2.5 bg-card rounded-lg">
              {!collapsed ? (
                <>
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-xs">
                    {whopUser.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight truncate">
                      {whopUser.name}
                    </p>
                    <p className="text-xs text-muted leading-tight">
                      @{whopUser.username}
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-xs mx-auto">
                  {whopUser.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
