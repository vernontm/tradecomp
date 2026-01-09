"use client";

import { useState, useEffect } from "react";
import { supabase, TradingAccount } from "@/lib/supabase";
import { WhopUser } from "../TradingApp";
import {
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit3,
  X,
  Check,
  Lock,
} from "lucide-react";

interface AdminUsersProps {
  whopUser: WhopUser;
}

interface UserWithAccounts {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  accounts: TradingAccount[];
}

export default function AdminUsers({ whopUser }: AdminUsersProps) {
  const [users, setUsers] = useState<UserWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>("");
  const [editingStarting, setEditingStarting] = useState<string | null>(null);
  const [editStartingBalance, setEditStartingBalance] = useState<string>("");

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

  const startEditBalance = (account: TradingAccount) => {
    setEditingAccount(account.id);
    setEditBalance(account.current_balance.toString());
  };

  const cancelEditBalance = () => {
    setEditingAccount(null);
    setEditBalance("");
  };

  const startEditStarting = (account: TradingAccount) => {
    setEditingStarting(account.id);
    setEditStartingBalance(account.starting_balance.toString());
  };

  const cancelEditStarting = () => {
    setEditingStarting(null);
    setEditStartingBalance("");
  };

  const saveStartingBalance = async (accountId: string) => {
    const newBalance = parseFloat(editStartingBalance);
    if (isNaN(newBalance)) {
      setMessage({ type: "error", text: "Invalid balance value" });
      return;
    }

    try {
      const { error } = await supabase
        .from("trading_accounts")
        .update({ starting_balance: newBalance })
        .eq("id", accountId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) => ({
          ...user,
          accounts: user.accounts.map((acc) =>
            acc.id === accountId
              ? { ...acc, starting_balance: newBalance }
              : acc
          ),
        }))
      );
      setEditingStarting(null);
      setEditStartingBalance("");
      setMessage({
        type: "success",
        text: "Starting balance updated successfully.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Failed to update starting balance",
      });
    }
  };

  const saveBalanceOverride = async (accountId: string) => {
    const newBalance = parseFloat(editBalance);
    if (isNaN(newBalance)) {
      setMessage({ type: "error", text: "Invalid balance value" });
      return;
    }

    try {
      const { error } = await supabase
        .from("trading_accounts")
        .update({
          current_balance: newBalance,
          balance_override: true,
        })
        .eq("id", accountId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) => ({
          ...user,
          accounts: user.accounts.map((acc) =>
            acc.id === accountId
              ? { ...acc, current_balance: newBalance, balance_override: true }
              : acc
          ),
        }))
      );
      setEditingAccount(null);
      setEditBalance("");
      setMessage({
        type: "success",
        text: "Balance overridden successfully. This account will be skipped during auto-refresh.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Failed to override balance",
      });
    }
  };

  const clearBalanceOverride = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from("trading_accounts")
        .update({ balance_override: false })
        .eq("id", accountId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((user) => ({
          ...user,
          accounts: user.accounts.map((acc) =>
            acc.id === accountId ? { ...acc, balance_override: false } : acc
          ),
        }))
      );
      setMessage({
        type: "success",
        text: "Override cleared. Balance will update on next refresh.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Failed to clear override",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-primary" size={32} />
              <h2 className="text-2xl font-bold text-gradient-primary">
                Users & Accounts
              </h2>
            </div>
            <p className="text-white/70">
              Manage users and override account balances
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
            {refreshing ? "Refreshing..." : "Refresh Balances"}
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
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-white/50 uppercase tracking-wider mb-2">
            Total Users
          </p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-white/50 uppercase tracking-wider mb-2">
            Total Accounts
          </p>
          <p className="text-2xl font-bold">{totalAccounts}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-white/50 uppercase tracking-wider mb-2">
            Active Accounts
          </p>
          <p className="text-2xl font-bold">{activeAccounts}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">All Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Starting
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Leaderboard
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) =>
                user.accounts.length === 0 ? (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-white/50">{user.email}</p>
                        <button
                          onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                          className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            user.is_admin
                              ? "bg-primary/20 text-primary"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {user.is_admin ? "Admin" : "User"}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/50" colSpan={4}>
                      No accounts
                    </td>
                  </tr>
                ) : (
                  user.accounts.map((acc, idx) => (
                    <tr key={acc.id} className="hover:bg-white/5">
                      {idx === 0 && (
                        <td className="px-6 py-4" rowSpan={user.accounts.length}>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-white/50">{user.email}</p>
                            <button
                              onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                              className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                                user.is_admin
                                  ? "bg-primary/20 text-primary"
                                  : "bg-white/10 text-white/50"
                              }`}
                            >
                              {user.is_admin ? "Admin" : "User"}
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70">#{acc.account_number.slice(-4)}</span>
                          {acc.balance_override && (
                            <span className="flex items-center gap-1 text-xs text-yellow-400" title="Balance manually overridden">
                              <Lock size={12} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingStarting === acc.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              value={editStartingBalance}
                              onChange={(e) => setEditStartingBalance(e.target.value)}
                              className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-right"
                              autoFocus
                            />
                            <button
                              onClick={() => saveStartingBalance(acc.id)}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEditStarting}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-white/70">
                              ${acc.starting_balance.toFixed(2)}
                            </span>
                            <button
                              onClick={() => startEditStarting(acc)}
                              className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded"
                              title="Edit starting balance"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingAccount === acc.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              value={editBalance}
                              onChange={(e) => setEditBalance(e.target.value)}
                              className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-right"
                              autoFocus
                            />
                            <button
                              onClick={() => saveBalanceOverride(acc.id)}
                              className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                              title="Save override"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEditBalance}
                              className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <span className={`font-medium ${acc.balance_override ? "text-yellow-400" : ""}`}>
                              ${acc.current_balance.toFixed(2)}
                            </span>
                            <button
                              onClick={() => startEditBalance(acc)}
                              className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded"
                              title="Override balance"
                            >
                              <Edit3 size={14} />
                            </button>
                            {acc.balance_override && (
                              <button
                                onClick={() => clearBalanceOverride(acc.id)}
                                className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"
                                title="Clear override"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            toggleAccountLeaderboard(acc.id, acc.show_on_leaderboard)
                          }
                          className={`text-xs px-2 py-1 rounded ${
                            acc.show_on_leaderboard
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {acc.show_on_leaderboard ? "Visible" : "Hidden"}
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
