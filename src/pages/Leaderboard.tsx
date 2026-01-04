import { useEffect, useState } from 'react'
import { supabase, LeaderboardEntry } from '../lib/supabase'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('percentage_change', { ascending: false })

      if (error) throw error

      const formattedData: LeaderboardEntry[] = data.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        account_id: entry.id,
        starting_balance: entry.starting_balance,
        current_balance: entry.current_balance,
        profit: entry.current_balance - entry.starting_balance,
        percentage_change: entry.percentage_change || ((entry.current_balance - entry.starting_balance) / entry.starting_balance) * 100,
        is_active: entry.is_active,
        last_updated: entry.last_updated,
      }))

      setLeaderboard(formattedData)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="text-primary" size={32} />
          <h2 className="text-2xl font-bold text-gradient-primary">Leaderboard</h2>
        </div>
        <p className="text-white/70">
          Rankings based on percentage gain. Compete with other traders to reach the top!
        </p>
      </div>

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Trader
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Starting Balance
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Profit/Loss
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/70 uppercase tracking-wider">
                  % Change
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                    No participants yet. Be the first to join!
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isPositive = entry.percentage_change >= 0
                  return (
                    <tr
                      key={entry.account_id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold">
                          {getRankBadge(entry.rank)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                            {entry.username[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{entry.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        ${entry.starting_balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        ${entry.current_balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}${entry.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? (
                            <TrendingUp size={16} className="text-green-500" />
                          ) : (
                            <TrendingDown size={16} className="text-red-500" />
                          )}
                          <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{entry.percentage_change.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          entry.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {entry.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Competition Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Total Participants</p>
              <p className="text-2xl font-bold text-primary">{leaderboard.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Top Performer</p>
              <p className="text-2xl font-bold text-green-500">
                +{leaderboard[0]?.percentage_change.toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Active Traders</p>
              <p className="text-2xl font-bold">
                {leaderboard.filter(e => e.is_active).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
