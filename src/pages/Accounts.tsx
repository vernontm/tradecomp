import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TradingAccount } from '../lib/supabase'
import { tradeLockerAPI, TradeLockerAccountInfo } from '../lib/tradelocker'
import { Wallet, AlertCircle, CheckCircle, ArrowLeft, Trash2, Eye, EyeOff, Pencil, Check, X } from 'lucide-react'

export default function Accounts() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [existingAccounts, setExistingAccounts] = useState<TradingAccount[]>([])
  const [availableAccounts, setAvailableAccounts] = useState<TradeLockerAccountInfo[]>([])
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [step, setStep] = useState<'credentials' | 'select'>('credentials')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    server: '',
  })
  const [editingNickname, setEditingNickname] = useState<string | null>(null)
  const [nicknameValue, setNicknameValue] = useState('')

  useEffect(() => {
    fetchExistingAccounts()
  }, [user])

  const fetchExistingAccounts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setExistingAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const handleFetchAccounts = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const accounts = await tradeLockerAPI.validateAndGetAccounts({
        email: formData.email,
        password: formData.password,
        server: formData.server,
        isDemo: false,
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found for these credentials.')
      }

      setAvailableAccounts(accounts)
      setStep('select')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to fetch accounts. Please check your credentials.',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccountIds(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handleAddSelectedAccounts = async () => {
    if (selectedAccountIds.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one account.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const accountsToAdd = availableAccounts.filter(acc => 
        selectedAccountIds.includes(acc.accountId)
      )

      for (const account of accountsToAdd) {
        const existingAccount = existingAccounts.find(
          ea => ea.account_number === (account.accNum || account.accountId)
        )

        if (existingAccount) {
          const { error: updateError } = await supabase
            .from('trading_accounts')
            .update({
              tl_email: formData.email,
              tl_server: formData.server,
              current_balance: account.balance,
              is_active: true,
              last_updated: new Date().toISOString(),
            })
            .eq('id', existingAccount.id)
          
          if (updateError) {
            console.error('Update error:', updateError)
            throw updateError
          }
        } else {
          const { error: insertError } = await supabase
            .from('trading_accounts')
            .insert({
              user_id: user?.id,
              account_type: 'tradelocker',
              tl_email: formData.email,
              tl_server: formData.server,
              account_number: account.accNum || account.accountId,
              account_name: account.name,
              starting_balance: account.balance,
              current_balance: account.balance,
              currency: account.currency,
              is_active: true,
              show_on_leaderboard: true,
            })
          
          if (insertError) {
            console.error('Insert error:', insertError)
            throw insertError
          }
        }
      }

      setMessage({
        type: 'success',
        text: `Successfully connected ${accountsToAdd.length} account(s)!`,
      })

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to add accounts. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const goBackToCredentials = () => {
    setStep('credentials')
    setAvailableAccounts([])
    setSelectedAccountIds([])
    setMessage(null)
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this account?')) return

    try {
      const { error } = await supabase
        .from('trading_accounts')
        .delete()
        .eq('id', accountId)

      if (error) throw error

      setExistingAccounts(prev => prev.filter(acc => acc.id !== accountId))
      setMessage({ type: 'success', text: 'Account removed successfully.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to remove account.' })
    }
  }

  const handleToggleLeaderboard = async (account: TradingAccount) => {
    const newValue = !account.show_on_leaderboard
    
    if (!newValue) {
      const confirmed = confirm(
        'Warning: Hiding this account from the leaderboard will disqualify it from the competition. Are you sure?'
      )
      if (!confirmed) return
    }

    try {
      const { error } = await supabase
        .from('trading_accounts')
        .update({ show_on_leaderboard: newValue })
        .eq('id', account.id)

      if (error) throw error

      setExistingAccounts(prev =>
        prev.map(acc =>
          acc.id === account.id ? { ...acc, show_on_leaderboard: newValue } : acc
        )
      )
      setMessage({
        type: 'success',
        text: newValue
          ? 'Account is now visible on the leaderboard.'
          : 'Account hidden from leaderboard and disqualified from competition.',
      })
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to update leaderboard visibility.' })
    }
  }

  const startEditingNickname = (account: TradingAccount) => {
    setEditingNickname(account.id)
    setNicknameValue(account.account_name || '')
  }

  const cancelEditingNickname = () => {
    setEditingNickname(null)
    setNicknameValue('')
  }

  const saveNickname = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('trading_accounts')
        .update({ account_name: nicknameValue.trim() || null })
        .eq('id', accountId)

      if (error) throw error

      setExistingAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId ? { ...acc, account_name: nicknameValue.trim() || undefined } : acc
        )
      )
      setEditingNickname(null)
      setNicknameValue('')
      setMessage({ type: 'success', text: 'Nickname updated successfully.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to update nickname.' })
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

      {/* Linked Accounts Section */}
      {existingAccounts.length > 0 && (
        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet size={20} className="text-primary" />
            Linked Accounts ({existingAccounts.length})
          </h3>
          <div className="space-y-3">
            {existingAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 border rounded-xl ${
                  account.show_on_leaderboard 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {editingNickname === account.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nicknameValue}
                          onChange={(e) => setNicknameValue(e.target.value)}
                          placeholder="Enter nickname"
                          className="flex-1 px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveNickname(account.id)
                            if (e.key === 'Escape') cancelEditingNickname()
                          }}
                        />
                        <button
                          onClick={() => saveNickname(account.id)}
                          className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelEditingNickname}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">
                          {account.account_name || 'TradeLocker Account'}
                        </span>
                        <button
                          onClick={() => startEditingNickname(account)}
                          className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded"
                          title="Edit nickname"
                        >
                          <Pencil size={14} />
                        </button>
                        {account.is_active && account.show_on_leaderboard && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                        {!account.show_on_leaderboard && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                            Disqualified
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-white/70 mt-1 font-mono">
                      Account #: {account.account_number}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {account.tl_email} • {account.tl_server}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {account.currency || 'USD'} {(account.current_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-white/50">
                        Started: {(account.starting_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleLeaderboard(account)}
                      className={`p-2 rounded-lg transition-colors ${
                        account.show_on_leaderboard
                          ? 'text-green-400 hover:bg-green-500/20'
                          : 'text-red-400 hover:bg-red-500/20'
                      }`}
                      title={account.show_on_leaderboard ? 'Hide from leaderboard' : 'Show on leaderboard'}
                    >
                      {account.show_on_leaderboard ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Remove account"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'credentials' ? (
        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Wallet size={20} className="text-primary" />
            Account Credentials
          </h3>

          <form onSubmit={handleFetchAccounts} className="space-y-4">
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
              {loading ? 'Fetching Accounts...' : 'Fetch Accounts'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Wallet size={20} className="text-primary" />
              Select Accounts to Add
            </h3>
            <button
              onClick={goBackToCredentials}
              className="text-white/70 hover:text-white flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {availableAccounts.map((account) => {
              const isSelected = selectedAccountIds.includes(account.accountId)
              const isAlreadyLinked = existingAccounts.some(
                ea => ea.account_number === (account.accNum || account.accountId)
              )
              
              return (
                <div
                  key={account.accountId}
                  onClick={() => toggleAccountSelection(account.accountId)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary/20 border-primary'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{account.name}</span>
                        {isAlreadyLinked && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            Already Linked
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/50 mt-1">
                        Account #{account.accNum || account.accountId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {account.currency} {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-white/50">Balance</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-white/50">Equity</p>
                      <p className="text-white">{account.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Margin</p>
                      <p className="text-white">{account.margin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-white/50">Free Margin</p>
                      <p className="text-white">{account.freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleAddSelectedAccounts}
            disabled={loading || selectedAccountIds.length === 0}
            className="w-full py-3 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            {loading ? 'Adding Accounts...' : `Add ${selectedAccountIds.length} Selected Account(s)`}
          </button>
        </div>
      )}

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
