"use client";

import { useState, useEffect } from "react";
import { WhopUser } from "../TradingApp";
import { supabase, CompetitionSettings } from "@/lib/supabase";
import {
  BookOpen,
  ExternalLink,
  CheckCircle,
  Calendar,
  Trophy,
  Gift,
} from "lucide-react";

interface GettingStartedProps {
  whopUser: WhopUser;
}

export default function GettingStarted({ whopUser }: GettingStartedProps) {
  const [settings, setSettings] = useState<CompetitionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("competition_settings")
        .select("*")
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Sign up for the broker",
      description:
        "Register an account using the referral link below to ensure all traders have the same market environment.",
      action: settings?.referral_link ? (
        <a
          href={settings.referral_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-lg hover:opacity-90 transition-all"
        >
          <ExternalLink size={16} />
          Open Broker Registration
        </a>
      ) : null,
    },
    {
      number: 2,
      title: "Create Live account",
      description:
        "After registration, choose to create a Live account with TradeLocker as your trading platform.",
    },
    {
      number: 3,
      title: "Fund the account",
      description:
        "Deposit a MINIMUM of $100 to participate in the competition. The more you deposit, the more potential profit!",
    },
    {
      number: 4,
      title: "Connect your account",
      description:
        'Go to the "My Account" section and enter your TradeLocker credentials to link your trading account.',
    },
    {
      number: 5,
      title: "Start trading!",
      description:
        "Your balance will be tracked automatically. The trader with the highest percentage gain wins!",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-gradient-primary">
            Getting Started
          </h2>
        </div>
        <p className="text-muted text-sm">
          Welcome, {whopUser.name}! Follow these steps to join the trading
          competition.
        </p>
      </div>

      {/* Prize & Timeline Section */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="text-primary" size={20} />
          <h3 className="text-base font-semibold">Competition Prize</h3>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Gift className="text-primary" size={28} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {settings?.prize_amount || "$500"}
            </p>
            <p className="text-sm text-muted">
              {settings?.prize_description || "Cash prize for the top trader with highest % gain"}
            </p>
          </div>
        </div>
        
        {/* Timeline in Prize Section */}
        {settings && (
          <div className="border-t border-primary/20 pt-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-primary" size={16} />
              <span className="text-sm font-medium">Competition Period</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted">Starts:</span>
                <span className="font-semibold">
                  {new Date(settings.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} at 12:00 AM CST
                </span>
              </div>
              <span className="hidden sm:inline text-muted">→</span>
              <div className="flex items-center gap-2">
                <span className="text-muted">Ends:</span>
                <span className="font-semibold">
                  {new Date(settings.end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} at 11:59 PM CST
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-primary font-medium">
              {(() => {
                const now = new Date();
                const end = new Date(settings.end_date);
                const diff = end.getTime() - now.getTime();
                if (diff <= 0) return "Competition Ended";
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                return `${days} days, ${hours} hours remaining`;
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Broker Signup CTA */}
      {settings?.referral_link && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold mb-1">Ready to Compete?</h3>
              <p className="text-muted text-sm">Sign up with our partner broker to get started</p>
            </div>
            <a
              href={settings.referral_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 gradient-primary text-white font-medium rounded-lg hover:opacity-90 transition-all text-sm"
            >
              <ExternalLink size={16} />
              Sign Up Now
            </a>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold mb-4">How to Enter</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-border mx-auto mt-1"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <h4 className="font-medium text-sm text-white mb-1">{step.title}</h4>
                <p className="text-muted text-xs mb-2">{step.description}</p>
                {step.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold mb-3">Competition Rules</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-muted text-sm">
              Minimum starting balance of $100 required
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-muted text-sm">
              Rankings based on percentage gain
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-muted text-sm">
              Balances updated every 15 minutes
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-muted text-sm">
              One account per user in competition
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
