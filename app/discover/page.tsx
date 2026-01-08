import { TrendingUp, Trophy, Wallet, Users } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-6">
            <TrendingUp size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">
            Trading Competition
          </h1>
          <p className="text-white/70 text-lg">
            Compete with traders worldwide. Connect your TradeLocker account and climb the leaderboard!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <Trophy className="text-primary mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-3">Compete for Glory</h3>
            <p className="text-white/60">
              Rankings based on percentage gains. The best traders rise to the top regardless of account size.
            </p>
          </div>
          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <Wallet className="text-primary mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-3">Easy Connection</h3>
            <p className="text-white/60">
              Simply connect your TradeLocker account. Your balances are automatically synced every 15 minutes.
            </p>
          </div>
          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <TrendingUp className="text-primary mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-3">Real-Time Tracking</h3>
            <p className="text-white/60">
              Watch your progress on the live leaderboard. Track your P/L and percentage gains in real-time.
            </p>
          </div>
          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <Users className="text-primary mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-3">Community</h3>
            <p className="text-white/60">
              Join a community of traders. Learn from the best and share your strategies.
            </p>
          </div>
        </div>

        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h3 className="text-xl font-semibold mb-4">How to Get Started</h3>
          <ol className="space-y-4 text-white/70">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
              <div>
                <strong className="text-white">Sign up for the broker</strong>
                <p className="text-sm mt-1">Register using the referral link to ensure fair competition conditions.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
              <div>
                <strong className="text-white">Create a Live account</strong>
                <p className="text-sm mt-1">Choose TradeLocker as your trading platform.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
              <div>
                <strong className="text-white">Fund your account</strong>
                <p className="text-sm mt-1">Deposit a minimum of $100 to participate.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</span>
              <div>
                <strong className="text-white">Connect & Trade</strong>
                <p className="text-sm mt-1">Link your account and start competing!</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
