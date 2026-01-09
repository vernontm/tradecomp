"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { WhopUser } from "../TradingApp";
import {
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AdminCronLogsProps {
  whopUser: WhopUser;
}

interface CronLog {
  id: string;
  job_name: string;
  status: "started" | "completed" | "failed";
  accounts_updated: number;
  accounts_total: number;
  errors: string[] | null;
  details: any;
  created_at: string;
}

export default function AdminCronLogs({ whopUser }: AdminCronLogsProps) {
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("cron_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching cron logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} className="text-green-400" />;
      case "failed":
        return <XCircle size={16} className="text-red-400" />;
      case "started":
        return <Loader2 size={16} className="text-yellow-400 animate-spin" />;
      default:
        return <AlertCircle size={16} className="text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      case "started":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-white/10 text-muted";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading cron logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-primary" size={32} />
              <h2 className="text-2xl font-bold text-gradient-primary">
                Cron Job Logs
              </h2>
            </div>
            <p className="text-white/70">
              View balance refresh job history
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-border text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Errors
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    No cron logs yet
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/70">{log.job_name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-400 font-medium">{log.accounts_updated}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-white/70">{log.accounts_total}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-white/70">{formatTimeAgo(log.created_at)}</span>
                        <p className="text-xs text-white/40">{formatDate(log.created_at)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.errors && log.errors.length > 0 ? (
                        <div className="max-w-xs">
                          <span className="text-red-400 text-sm">
                            {log.errors.length} error(s)
                          </span>
                          <div className="text-xs text-white/40 truncate">
                            {log.errors[0]}
                          </div>
                        </div>
                      ) : (
                        <span className="text-white/30">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
