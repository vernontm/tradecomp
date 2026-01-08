"use client";

import { useState, useEffect } from "react";
import { supabase, TradingAccount } from "@/lib/supabase";
import {
  Users,
  TrendingUp,
  RefreshCw,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export interface WhopUser {
  id: string;
  username: string;
  name: string;
  accessLevel: string;
}

interface AdminDashboardProps {
  whopUser: WhopUser;
  companyId: string;
  companyName: string;
}

interface UserWithAccounts {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  accounts: TradingAccount[];
}

export default function AdminDashboard({
  whopUser,
  companyId,
  companyName,
}: AdminDashboardProps) {
  const [users, setUsers] = useState<UserWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      const { data: accountsData, error: accountsError } = await supabase
        .from("trading_accounts")
        .select("*");

      if (accountsError) throw accountsError;

      const usersWithAccounts = usersData.map((user) => ({
        ...user,
        accounts: accountsData.filter((acc) => acc.user_id === user.id),
      }));

      setUsers(usersWithAccounts);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh balances");
      }

      setMessage({
        type: "success",
        text: `Successfully refreshed ${data.updated} accounts`,
      });
      fetchUsers();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to refresh balances",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const toggleUserAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_admin: !currentStatus } : user
        )
      );
      setMessage({
        type: "success",
        text: `User admin status updated`,
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Failed to update user status",
      });
    }
  };

  const toggleAccountLeaderboard = async (
    accountId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("trading_accounts")
        .update({ show_on_leaderboard: !currentStatus })
        .eq("id", accountId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) => ({
          ...user,
          accounts: user.accounts.map((acc) =>
            acc.id === accountId
              ? { ...acc, show_on_leaderboard: !currentStatus }
              : acc
          ),
        }))
      );
      setMessage({
        type: "success",
        text: `Account leaderboard status updated`,
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Failed to update account status",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const totalAccounts = users.reduce(
    (sum, user) => sum + user.accounts.length,
    0
  );
  const activeAccounts = users.reduce(
    (sum, user) => sum + user.accounts.filter((a) => a.is_active).length,
    0
  );

  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-primary" size={32} />
                <h1 className="text-2xl font-bold text-gradient-primary">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-white/70">
                Managing: {companyName} • Welcome, {whopUser.name}
              </p>
            </div>
            <button
              onClick={handleRefreshBalances}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh All Balances"}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500 text-green-500"
                : "bg-red-500/10 border-red-500 text-red-500"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/50 uppercase tracking-wider">
                Total Users
              </p>
              <Users size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>

          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/50 uppercase tracking-wider">
                Total Accounts
              </p>
              <FileText size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-bold">{totalAccounts}</p>
          </div>

          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/50 uppercase tracking-wider">
                Active Accounts
              </p>
              <TrendingUp size={20} className="text-primary" />
            </div>
            <p className="text-2xl font-bold">{activeAccounts}</p>
          </div>
        </div>

        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold">Users & Accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                    Accounts
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white/70 uppercase tracking-wider">
                    Total Balance
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white/70 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-white/50">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70">
                        {user.accounts.length} account(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium">
                        $
                        {user.accounts
                          .reduce((sum, acc) => sum + acc.current_balance, 0)
                          .toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_admin
                            ? "bg-primary/20 text-primary"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {user.is_admin ? "Admin" : "User"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.accounts.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() =>
                            toggleAccountLeaderboard(
                              acc.id,
                              acc.show_on_leaderboard
                            )
                          }
                          className={`text-xs px-2 py-1 rounded mr-1 ${
                            acc.show_on_leaderboard
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                          title={`${acc.account_number}: ${
                            acc.show_on_leaderboard
                              ? "On Leaderboard"
                              : "Hidden"
                          }`}
                        >
                          #{acc.account_number.slice(-4)}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
