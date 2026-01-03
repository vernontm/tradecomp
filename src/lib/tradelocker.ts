import axios from 'axios'

const TRADELOCKER_DEMO_URL = 'https://demo.tradelocker.com'
const TRADELOCKER_LIVE_URL = 'https://live.tradelocker.com'
const TRADELOCKER_API_KEY = import.meta.env.VITE_TRADELOCKER_API_KEY

const isProduction = import.meta.env.PROD
const USE_API_PROXY = isProduction

export interface TradeLockerCredentials {
  email: string
  password: string
  server: string
  isDemo?: boolean
}

export interface TradeLockerAccountInfo {
  accountId: string
  balance: number
  equity: number
  margin: number
  freeMargin: number
  profit: number
  currency: string
}

export class TradeLockerAPI {
  private accessToken: string | null = null
  private apiUrl: string = TRADELOCKER_LIVE_URL

  private getApiUrl(isDemo: boolean = false): string {
    return isDemo ? TRADELOCKER_DEMO_URL : TRADELOCKER_LIVE_URL
  }

  private getHeaders(includeAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': TRADELOCKER_API_KEY || ''
    }

    if (includeAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  async authenticate(credentials: TradeLockerCredentials): Promise<string> {
    this.apiUrl = this.getApiUrl(credentials.isDemo)

    try {
      const url = USE_API_PROXY 
        ? '/api/tradelocker-auth'
        : `${this.apiUrl}/auth/jwt/token`
      
      const config = USE_API_PROXY
        ? {}
        : { headers: this.getHeaders() }

      const response = await axios.post(
        url,
        {
          email: credentials.email,
          password: credentials.password,
          server: credentials.server
        },
        config
      )

      this.accessToken = response.data.accessToken || null
      return this.accessToken || ''
    } catch (error: any) {
      console.error('TradeLocker authentication failed:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      throw new Error(error.response?.data?.error || 'Failed to authenticate with TradeLocker')
    }
  }

  async getAccountInfo(): Promise<TradeLockerAccountInfo> {
    if (!this.accessToken) {
      throw new Error('Not authenticated')
    }

    try {
      const url = USE_API_PROXY
        ? '/api/tradelocker-accounts'
        : `${this.apiUrl}/auth/jwt/all-accounts`
      
      const config = USE_API_PROXY
        ? { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
        : { headers: this.getHeaders(true) }

      const response = await axios.get(url, config)

      const accounts = response.data.accounts || []
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const account = accounts[0]

      return {
        accountId: account.id,
        balance: account.balance || 0,
        equity: account.equity || 0,
        margin: account.margin || 0,
        freeMargin: account.freeMargin || 0,
        profit: account.profit || 0,
        currency: account.currency || 'USD'
      }
    } catch (error) {
      console.error('Failed to get account info:', error)
      throw new Error('Failed to retrieve account information')
    }
  }

  async validateCredentials(credentials: TradeLockerCredentials): Promise<boolean> {
    try {
      await this.authenticate(credentials)
      await this.getAccountInfo()
      return true
    } catch (error) {
      console.error('TradeLocker validation error:', error)
      return false
    }
  }
}

export const tradeLockerAPI = new TradeLockerAPI()
