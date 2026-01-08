import Link from "next/link";
import { TrendingUp, Trophy, Wallet } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-6">
          <TrendingUp size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gradient-primary mb-4">
          Trading Competition
        </h1>
        <p className="text-white/70 text-lg mb-8">
          Welcome to the trading competition! Connect your TradeLocker account and compete with other traders to reach the top of the leaderboard.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <Trophy className="text-primary mb-3" size={32} />
            <h3 className="font-semibold mb-2">Compete</h3>
            <p className="text-sm text-white/60">Rank based on % gains</p>
          </div>
          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <Wallet className="text-primary mb-3" size={32} />
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-sm text-white/60">Link your TradeLocker</p>
          </div>
          <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <TrendingUp className="text-primary mb-3" size={32} />
            <h3 className="font-semibold mb-2">Trade</h3>
            <p className="text-sm text-white/60">Grow your account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
