import { TrendingUp, ExternalLink } from 'lucide-react'

export default function GettingStarted() {
  const referralLink = import.meta.env.VITE_REFERRAL_LINK || 'https://plexytrade.com/?t=TBZp1B&term=register'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="text-primary" size={32} />
          <h2 className="text-2xl font-bold text-gradient-primary">Getting Started</h2>
        </div>
        <p className="text-white/70">
          Follow these steps to join the trading competition and start competing for the top spot!
        </p>
      </div>

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-semibold mb-6 text-white">How to Enter Trading Competition</h3>
        
        <ol className="space-y-6">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg">
              1
            </span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Sign up for the broker</h4>
              <p className="text-white/70 mb-3">
                Register an account using the referral link to ensure all traders have the same market environment.
              </p>
              <a
                href={referralLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-all"
              >
                Open Referral Link
                <ExternalLink size={16} />
              </a>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg">
              2
            </span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Create Live account</h4>
              <p className="text-white/70">
                Choose to create a Live account with TradeLocker platform. Make sure to select the correct account type during registration.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg">
              3
            </span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Fund the account</h4>
              <p className="text-white/70">
                Deposit a <strong className="text-primary">MINIMUM of $100</strong> to participate in the competition. Only accounts with a starting balance of $100 or more will appear on the leaderboard.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg">
              4
            </span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Enter your account info</h4>
              <p className="text-white/70 mb-3">
                Go to the Accounts page and fill in the form with your TradeLocker credentials to connect your trading account.
              </p>
              <a
                href="/accounts"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
              >
                Go to Accounts Page
              </a>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg">
              5
            </span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-2">Start trading!</h4>
              <p className="text-white/70">
                The trader with the highest <strong className="text-primary">% gain</strong> will win the competition. Track your progress on the leaderboard and compete with other traders!
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Important Notes</h3>
        <ul className="space-y-2 text-white/70">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>All participants must use the provided referral link to ensure fair competition</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Only Live accounts are eligible for the competition (Demo accounts are for testing only)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Minimum starting balance of $100 is required to appear on the leaderboard</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Rankings are based on percentage gain, not absolute profit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Check the Admin Panel for competition start and end dates</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
