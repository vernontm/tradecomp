import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TradingAccount } from '../lib/supabase'
import { TrendingUp, TrendingDown, DollarSign, Trophy } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [account, setAccount] = useState<TradingAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalParticipants, setTotalParticipants] = useState(0)

  useEffect(() => {
    fetchAccountData()
  }, [user])

  const fetchAccountData = async () => {
    if (!user) return

    try {
      const { data: accountData, error: accountError } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (accountError && accountError.code !== 'PGRST116') {
        throw accountError
      }

      setAccount(accountData)

      const { data: leaderboardData } = await supabase
        .from('trading_accounts')
        .select('user_id, starting_balance, current_balance')
        .gte('starting_balance', 100)
        .order('current_balance', { ascending: false })

      if (leaderboardData) {
        setTotalParticipants(leaderboardData.length)
        const rank = leaderboardData.findIndex(entry => entry.user_id === user.id)
        if (rank !== -1) {
          setUserRank(rank + 1)
        }
      }
    } catch (error) {
      console.error('Error fetching account data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentageChange = () => {
    if (!account || account.starting_balance === 0) return 0
    return ((account.current_balance - account.starting_balance) / account.starting_balance) * 100
  }

  const calculateProfit = () => {
    if (!account) return 0
    return account.current_balance - account.starting_balance
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const percentageChange = calculatePercentageChange()
  const profit = calculateProfit()
  const isPositive = percentageChange >= 0

  return (
    <div className="space-y-6">
      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gradient-primary mb-2">Trading Dashboard</h2>
        <p className="text-white/70">Welcome back, {user?.username}! Here's an overview of your trading activity.</p>
      </div>

      {!account ? (
        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <TrendingUp size={32} className="text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Trading Account Connected</h3>
          <p className="text-white/70 mb-6">Connect your TradeLocker account to start competing!</p>
          <a
            href="/accounts"
            className="inline-block px-6 py-3 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-all"
          >
            Connect Account
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/50 uppercase tracking-wider">Account Type</p>
                <DollarSign size={20} className="text-primary" />
              </div>
              <p className="text-2xl font-bold">{account.account_type === 'tradelocker' ? 'TradeLocker' : 'MT5'}</p>
            </div>

            <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/50 uppercase tracking-wider">Current Balance</p>
                <DollarSign size={20} className="text-primary" />
              </div>
              <p className="text-2xl font-bold">${account.current_balance.toFixed(2)}</p>
            </div>

            <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/50 uppercase tracking-wider">Total P/L</p>
                {isPositive ? (
                  <TrendingUp size={20} className="text-green-500" />
                ) : (
                  <TrendingDown size={20} className="text-red-500" />
                )}
              </div>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}${profit.toFixed(2)}
              </p>
            </div>

            <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/50 uppercase tracking-wider">% Change</p>
                {isPositive ? (
                  <TrendingUp size={20} className="text-green-500" />
                ) : (
                  <TrendingDown size={20} className="text-red-500" />
                )}
              </div>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="text-primary" size={20} />
                Competition Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Your Rank</span>
                  <span className="text-xl font-bold text-primary">
                    {userRank ? `#${userRank}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Participants</span>
                  <span className="text-xl font-bold">{totalParticipants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Account Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    account.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Account Number</span>
                  <span className="font-medium">{account.account_number}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Starting Balance</span>
                  <span className="font-medium">${account.starting_balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/70">Last Updated</span>
                  <span className="font-medium">
                    {new Date(account.last_updated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
