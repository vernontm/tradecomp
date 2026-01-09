"use client";

import { useEffect, useState } from "react";
import { supabase, LeaderboardEntry } from "@/lib/supabase";
import { Trophy, TrendingUp, TrendingDown, Clock } from "lucide-react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<string>("");
  const [minutesAgo, setMinutesAgo] = useState<number>(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdated) {
        const now = new Date();
        const diffMs = now.getTime() - lastUpdated.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        setMinutesAgo(diffMins);

        const currentMinute = now.getMinutes();
        const nextUpdateMinute = Math.ceil(currentMinute / 15) * 15;
        const minutesLeft =
          nextUpdateMinute === currentMinute ? 15 : nextUpdateMinute - currentMinute;
        const secondsLeft = 60 - now.getSeconds();

        if (minutesLeft === 0 || (minutesLeft === 15 && secondsLeft === 60)) {
          setTimeUntilNext("< 1 min");
        } else {
          setTimeUntilNext(`${minutesLeft - 1}m ${secondsLeft}s`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("leaderboard_view")
        .select("*")
        .order("percentage_change", { ascending: false });

      if (error) throw error;

      const formattedData: LeaderboardEntry[] = data.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        account_id: entry.id,
        starting_balance: entry.starting_balance,
        current_balance: entry.current_balance,
        profit: entry.current_balance - entry.starting_balance,
        percentage_change:
          entry.percentage_change ||
          ((entry.current_balance - entry.starting_balance) /
            entry.starting_balance) *
            100,
        is_active: entry.is_active,
        last_updated: entry.last_updated,
      }));

      setLeaderboard(formattedData);

      if (formattedData.length > 0) {
        const mostRecent = formattedData.reduce((latest, entry) => {
          const entryDate = new Date(entry.last_updated);
          return entryDate > latest ? entryDate : latest;
        }, new Date(0));
        setLastUpdated(mostRecent);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-gradient-primary">
                Leaderboard
              </h2>
            </div>
            <p className="text-muted text-sm">
              Rankings based on percentage gain
            </p>
          </div>
          {lastUpdated && (
            <div className="text-left md:text-right bg-sidebar border border-border rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5 text-muted text-xs mb-0.5">
                <Clock size={12} />
                <span>Last Updated</span>
              </div>
              <p className="text-white text-sm font-medium">
                {minutesAgo === 0
                  ? "Just now"
                  : `${minutesAgo} min${minutesAgo === 1 ? "" : "s"} ago`}
              </p>
              <p className="text-[10px] text-primary">
                Next update in {timeUntilNext}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                  Trader
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Start
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">
                  Current
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  P/L
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">
                  % Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboard.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted text-sm"
                  >
                    No participants yet. Be the first to join!
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isPositive = entry.percentage_change >= 0;
                  return (
                    <tr
                      key={entry.account_id}
                      className="hover:bg-sidebar transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-base font-bold">
                          {getRankBadge(entry.rank)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-xs">
                            {entry.username[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">{entry.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm hidden md:table-cell">
                        ${entry.starting_balance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-sm hidden md:table-cell">
                        ${entry.current_balance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right hidden sm:table-cell">
                        <span
                          className={`font-medium text-sm ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}${entry.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? (
                            <TrendingUp size={14} className="text-green-400" />
                          ) : (
                            <TrendingDown size={14} className="text-red-400" />
                          )}
                          <span
                            className={`font-bold text-sm ${
                              isPositive ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {entry.percentage_change.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Competition Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-muted mb-0.5">Participants</p>
              <p className="text-lg font-bold text-primary">
                {leaderboard.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted mb-0.5">Top Performer</p>
              <p className="text-lg font-bold text-green-400">
                +{leaderboard[0]?.percentage_change.toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted mb-0.5">Active</p>
              <p className="text-lg font-bold">
                {leaderboard.filter((e) => e.is_active).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
