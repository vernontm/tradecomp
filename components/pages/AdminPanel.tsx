"use client";

import { useState, useEffect } from "react";
import { WhopUser } from "../TradingApp";
import { supabase, TradingAccount, CompetitionSettings } from "@/lib/supabase";
import {
  Settings,
  Users,
  RefreshCw,
  Save,
  Trophy,
  Calendar,
  Link,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface AdminPanelProps {
  whopUser: WhopUser;
}

interface UserWithAccounts {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  accounts: TradingAccount[];
}

export default function AdminPanel({ whopUser }: AdminPanelProps) {
  const [users, setUsers] = useState<UserWithAccounts[]>([]);
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    referral_link: "",
    prize_amount: "",
    prize_description: "",
    minimum_balance: "100",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users with their accounts
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Fetch accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from("trading_accounts")
        .select("*");

      if (accountsError) throw accountsError;

      // Combine users with their accounts
      const usersWithAccounts = (usersData || []).map((user) => ({
        ...user,
        accounts: (accountsData || []).filter((acc) => acc.user_id === user.id),
      }));

      setUsers(usersWithAccounts);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("competition_settings")
        .select("*")
        .single();

      if (settingsData) {
        setSettings(settingsData);
        setFormData({
          start_date: settingsData.start_date?.split("T")[0] || "",
          end_date: settingsData.end_date?.split("T")[0] || "",
          referral_link: settingsData.referral_link || "",
          prize_amount: settingsData.prize_amount || "",
          prize_description: settingsData.prize_description || "",
          minimum_balance: settingsData.minimum_balance?.toString() || "100",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("competition_settings")
        .upsert({
          id: 1,
          start_date: `${formData.start_date}T00:00:00-06:00`,
          end_date: `${formData.end_date}T23:59:00-06:00`,
          referral_link: formData.referral_link,
          prize_amount: formData.prize_amount,
          prize_description: formData.prize_description,
          minimum_balance: parseFloat(formData.minimum_balance) || 0,
        });

      if (error) throw error;
      setMessage({ type: "success", text: "Settings saved successfully!" });
      fetchData();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshBalances = async () => {
    setRefreshing(true);
    setMessage(null);

    try {
      const response = await fetch("/api/refresh-balances", {
        method: "POST",
        headers: {
          "x-admin-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to refresh balances");
      }

      const result = await response.json();
      setMessage({ 
        type: "success", 
        text: `Balances refreshed! Updated: ${result.updated}, Failed: ${result.failed}, Total: ${result.total}` 
      });
      fetchData();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to refresh balances" });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDebugAccounts = async () => {
    try {
      const response = await fetch("/api/debug-accounts", {
        method: "POST",
        headers: {
          "x-admin-api-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "",
        },
      });

      if (!response.ok) throw new Error("Failed to debug accounts");

      const result = await response.json();
      console.log("Debug accounts:", result);
      setMessage({ 
        type: "success", 
        text: `Debug: ${result.active_accounts} active, ${result.accounts_with_password} with passwords, ${result.accounts_without_password} without passwords` 
      });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to debug accounts" });
    }
  };

  const toggleUserAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error toggling admin:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gradient-primary">Admin Panel</h2>
        </div>
        <p className="text-muted text-sm">
          Manage competition settings and users
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Competition Settings */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-primary" />
          Competition Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              <Calendar size={12} className="inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              <Calendar size={12} className="inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted mb-1.5">
              <Link size={12} className="inline mr-1" />
              Broker Referral Link
            </label>
            <input
              type="url"
              value={formData.referral_link}
              onChange={(e) => setFormData({ ...formData, referral_link: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              <DollarSign size={12} className="inline mr-1" />
              Prize Amount
            </label>
            <input
              type="text"
              value={formData.prize_amount}
              onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
              placeholder="$500"
              className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Prize Description
            </label>
            <input
              type="text"
              value={formData.prize_description}
              onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
              placeholder="Cash prize for top trader"
              className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted mb-1.5">
              <DollarSign size={12} className="inline mr-1" />
              Minimum Starting Balance
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={formData.minimum_balance}
                onChange={(e) => setFormData({ ...formData, minimum_balance: e.target.value })}
                placeholder="100"
                className="w-32 px-3 py-2 bg-sidebar border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              />
              <span className="text-muted text-sm">Set to 0 to disable minimum requirement</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </button>

          <button
            onClick={handleRefreshBalances}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-sidebar border border-border text-white text-sm font-medium rounded-lg hover:bg-card transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Balances"}
          </button>

          <button
            onClick={handleDebugAccounts}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-medium rounded-lg hover:bg-yellow-500/30 transition-all"
          >
            <AlertCircle size={16} />
            Debug Accounts
          </button>
        </div>
      </div>

      {/* Users */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          Users ({users.length})
        </h3>

        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-sidebar rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-xs">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">@{user.username}</p>
                  <p className="text-xs text-muted">
                    {user.accounts.length} account(s)
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  user.is_admin
                    ? "bg-primary/20 text-primary"
                    : "bg-sidebar border border-border text-muted hover:text-white"
                }`}
              >
                {user.is_admin ? "Admin" : "User"}
              </button>
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-center text-muted text-sm py-4">No users yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
