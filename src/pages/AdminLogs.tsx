import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

interface CronLog {
  id: string
  job_name: string
  status: 'started' | 'completed' | 'failed'
  accounts_updated: number
  accounts_total: number
  errors: string[] | null
  details: Record<string, any> | null
  created_at: string
}

export default function AdminLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<CronLog[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndFetchLogs()
  }, [user])

  const checkAdminAndFetchLogs = async () => {
    if (!user) return

    try {
      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!userData?.is_admin) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)
      await fetchLogs()
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('cron_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />
      case 'failed':
        return <XCircle size={16} className="text-red-500" />
      case 'started':
        return <Clock size={16} className="text-yellow-500" />
      default:
        return <Activity size={16} className="text-white/50" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400'
      case 'failed':
        return 'bg-red-500/20 text-red-400'
      case 'started':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-white/20 text-white/70'
    }
  }

  const formatDuration = (details: Record<string, any> | null) => {
    if (!details?.duration_ms) return '-'
    const ms = details.duration_ms
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
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

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500 rounded-2xl p-8 text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-white/70">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-primary" size={32} />
              <h2 className="text-2xl font-bold text-gradient-primary">Cron Job Logs</h2>
            </div>
            <p className="text-white/70">
              View balance refresh job history and status.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Triggered By</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase">Updated</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-white/70 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/50">
                    No logs yet. The cron job runs every 15 minutes.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-white/50">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-white/70 capitalize">
                        {log.details?.triggered_by || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="text-sm text-white">
                        {log.accounts_updated}/{log.accounts_total}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="text-sm text-white/70">
                        {formatDuration(log.details)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.errors && log.errors.length > 0 ? (
                        <div className="max-w-xs">
                          {log.errors.map((err, i) => (
                            <p key={i} className="text-xs text-red-400 truncate" title={err}>
                              {err}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-white/30">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Total Runs</p>
              <p className="text-2xl font-bold text-primary">{logs.filter(l => l.status !== 'started').length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Successful</p>
              <p className="text-2xl font-bold text-green-500">{logs.filter(l => l.status === 'completed').length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-500">{logs.filter(l => l.status === 'failed').length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">Last Run</p>
              <p className="text-lg font-bold text-white">
                {logs[0] ? new Date(logs[0].created_at).toLocaleTimeString() : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
