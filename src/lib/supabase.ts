import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  username: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface TradingAccount {
  id: string
  user_id: string
  account_type: 'tradelocker'
  tl_email: string
  tl_server: string
  account_number: string
  starting_balance: number
  current_balance: number
  is_active: boolean
  last_updated: string
  created_at: string
}

export interface CompetitionSettings {
  id: number
  start_date: string
  end_date: string
  referral_link: string
}

export interface LeaderboardEntry {
  rank: number
  username: string
  account_id: string
  starting_balance: number
  current_balance: number
  profit: number
  percentage_change: number
  is_active: boolean
  last_updated: string
}
