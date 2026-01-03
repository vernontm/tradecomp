import { useEffect, useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, TradingAccount, CompetitionSettings } from '../lib/supabase'
import { Shield, Calendar, Users } from 'lucide-react'
import { Navigate } from 'react-router-dom'

interface AccountWithUser extends TradingAccount {
  username: string
  email: string
}

export default function Admin() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<AccountWithUser[]>([])
  const [, setSettings] = useState<CompetitionSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    referral_link: '',
  })

  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('trading_accounts')
        .select(`
          *,
          users (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (accountsError) throw accountsError

      const formattedAccounts = accountsData.map((account: any) => ({
        ...account,
        username: account.users?.username || 'Unknown',
        email: account.users?.email || 'Unknown',
      }))

      setAccounts(formattedAccounts)

      const { data: settingsData, error: settingsError } = await supabase
        .from('competition_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError
      }

      if (settingsData) {
        setSettings(settingsData)
        setFormData({
          start_date: settingsData.start_date || '',
          end_date: settingsData.end_date || '',
          referral_link: settingsData.referral_link || '',
        })
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const { error } = await supabase
        .from('competition_settings')
        .upsert({
          id: 1,
          start_date: formData.start_date,
          end_date: formData.end_date,
          referral_link: formData.referral_link,
        })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Settings updated successfully!',
      })

      fetchAdminData()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update settings',
      })
    }
  }

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-primary" size={32} />
          <h2 className="text-2xl font-bold text-gradient-primary">Admin Panel</h2>
        </div>
        <p className="text-white/70">Manage competition settings and monitor participant accounts.</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-red-500/10 border-red-500 text-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-primary" />
          Competition Settings
        </h3>

        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Referral Link</label>
            <input
              type="url"
              value={formData.referral_link}
              onChange={(e) => setFormData({ ...formData, referral_link: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-all"
              placeholder="https://broker.com/referral"
              required
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-all"
          >
            Update Settings
          </button>
        </form>
      </div>

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Participant Accounts ({accounts.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">Account #</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white/70">Starting</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white/70">Current</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-white/70">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/50">
                    No accounts registered yet
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{account.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-white/70">{account.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-white/70">{account.account_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      ${account.starting_balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                      ${account.current_balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          account.is_active
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}
                      >
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white/70">
                      {new Date(account.last_updated).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
