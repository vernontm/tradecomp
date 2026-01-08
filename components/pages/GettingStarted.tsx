"use client";

import { useState, useEffect } from "react";
import { WhopUser } from "../TradingApp";
import { supabase, CompetitionSettings } from "@/lib/supabase";
import {
  BookOpen,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Calendar,
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
    <div className="space-y-6">
      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-primary" size={32} />
          <h2 className="text-2xl font-bold text-gradient-primary">
            Getting Started
          </h2>
        </div>
        <p className="text-white/70">
          Welcome, {whopUser.name}! Follow these steps to join the trading
          competition.
        </p>
      </div>

      {settings && (
        <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-primary" size={24} />
            <h3 className="text-lg font-semibold">Competition Period</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/50 mb-1">Start Date</p>
              <p className="text-lg font-semibold">
                {new Date(settings.start_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-white/50 mb-1">End Date</p>
              <p className="text-lg font-semibold">
                {new Date(settings.end_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">How to Enter</h3>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-white/10 mx-auto mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-6">
                <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                <p className="text-white/70 text-sm mb-3">{step.description}</p>
                {step.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-sidebar/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Competition Rules</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-white/70">
              Minimum starting balance of $100 required to participate
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-white/70">
              Rankings are based on percentage gain, not absolute profit
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-white/70">
              Balances are automatically updated every 15 minutes
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-white/70">
              Only one account per user can be entered in the competition
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-white/70">
              Deposits/withdrawals during competition may affect your standing
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
