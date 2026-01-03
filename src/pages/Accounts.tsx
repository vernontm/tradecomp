import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TradingAccount } from '../lib/supabase'
import { tradeLockerAPI } from '../lib/tradelocker'
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react'

export default function Accounts() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [existingAccount, setExistingAccount] = useState<TradingAccount | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    server: '',
  })

  useEffect(() => {
    fetchExistingAccount()
  }, [user])

  const fetchExistingAccount = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setExistingAccount(data)
    } catch (error) {
      console.error('Error fetching account:', error)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const isValid = await tradeLockerAPI.validateCredentials({
        email: formData.email,
        password: formData.password,
        server: formData.server,
        isDemo: false,
      })

      if (!isValid) {
        throw new Error('Invalid TradeLocker credentials. Please check your information.')
      }

      const accountInfo = await tradeLockerAPI.getAccountInfo()

      if (existingAccount) {
        const { error } = await supabase
          .from('trading_accounts')
          .update({
            tl_email: formData.email,
            tl_server: formData.server,
            account_number: accountInfo.accountId,
            starting_balance: accountInfo.balance,
            current_balance: accountInfo.balance,
            is_active: true,
            last_updated: new Date().toISOString(),
          })
          .eq('id', existingAccount.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('trading_accounts')
          .insert([
            {
              user_id: user?.id,
              account_type: 'tradelocker',
              tl_email: formData.email,
              tl_server: formData.server,
              account_number: accountInfo.accountId,
              starting_balance: accountInfo.balance,
              current_balance: accountInfo.balance,
              is_active: true,
            },
          ])

        if (error) throw error
      }

      setMessage({
        type: 'success',
        text: 'Trading account connected successfully!',
      })

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to connect account. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="text-primary" size={32} />
          <h2 className="text-2xl font-bold text-gradient-primary">Connect with TradeLocker</h2>
        </div>
        <p className="text-white/70">
          Connect your TradeLocker account to participate in the trading competition.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-red-500/10 border-red-500 text-red-500'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Wallet size={20} className="text-primary" />
          Account Credentials
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
              placeholder="Enter your TradeLocker email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 uppercase tracking-wider">
              Server
            </label>
            <input
              type="text"
              value={formData.server}
              onChange={(e) => setFormData({ ...formData, server: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
              placeholder="Enter your TradeLocker server"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Wallet size={20} />
            {loading ? 'Connecting...' : existingAccount ? 'Update Account' : 'Connect to TradeLocker'}
          </button>
        </form>
      </div>

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">How to Enter Trading Competition</h3>
        <ol className="space-y-3 text-white/70">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
              1
            </span>
            <div>
              <strong className="text-white">Sign up for the broker</strong>
              <p className="text-sm mt-1">
                Register an account using the referral link to ensure all traders have the same market environment.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
              2
            </span>
            <div>
              <strong className="text-white">Create Live account</strong>
              <p className="text-sm mt-1">Choose to create a Live account with TradeLocker platform.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
              3
            </span>
            <div>
              <strong className="text-white">Fund the account</strong>
              <p className="text-sm mt-1">Deposit a MINIMUM of $100 to participate in the competition.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
              4
            </span>
            <div>
              <strong className="text-white">Enter your account info</strong>
              <p className="text-sm mt-1">Fill in the form above with your TradeLocker credentials.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
              5
            </span>
            <div>
              <strong className="text-white">Start trading!</strong>
              <p className="text-sm mt-1">The trader with the highest % gain will win the competition.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}
