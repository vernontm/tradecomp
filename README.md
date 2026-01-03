# Trading Competition Platform

A modern trading competition platform built with React, Supabase, and TradeLocker API integration.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth support
- 📊 **Real-time Leaderboard**: Track competition rankings based on percentage gains
- 💼 **TradeLocker Integration**: Connect trading accounts via TradeLocker API
- 👥 **User Dashboard**: View personal trading statistics and competition status
- 🛡️ **Admin Panel**: Manage competition settings and monitor participants
- 📱 **Responsive Design**: Modern UI with Tailwind CSS and mobile support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Trading API**: TradeLocker
- **Deployment**: Vercel
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- TradeLocker API credentials
- Vercel account (for deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd windsurf-project-4
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor
3. Enable Google OAuth in Supabase Authentication settings (optional)
4. Copy your Supabase URL and anon key

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TRADELOCKER_API_URL=https://api.tradelocker.com
VITE_REFERRAL_LINK=https://plexytrade.com/?t=TBZp1B&term=register
```

### 5. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Database Schema

### Tables

- **users**: User profiles with admin flags
- **trading_accounts**: TradeLocker account credentials and balances
- **competition_settings**: Competition dates and referral links

### Views

- **leaderboard_view**: Calculated rankings with profit/loss percentages

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TRADELOCKER_API_URL`
   - `VITE_REFERRAL_LINK`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and API clients
│   ├── supabase.ts
│   └── tradelocker.ts
├── pages/             # Page components
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Leaderboard.tsx
│   ├── Accounts.tsx
│   └── Admin.tsx
├── App.tsx            # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Features Overview

### User Features

- **Sign up/Login**: Create account with email or Google
- **Connect Trading Account**: Link TradeLocker account with credentials
- **View Dashboard**: See personal statistics and competition ranking
- **Leaderboard**: View all participants ranked by percentage gain

### Admin Features

- **Competition Settings**: Set start/end dates and referral links
- **Monitor Accounts**: View all participant accounts and balances
- **Manage Users**: Track active/inactive accounts

## TradeLocker Integration

The app integrates with TradeLocker API to:
- Authenticate user accounts
- Fetch real-time account balances
- Validate account credentials
- Track trading performance

## Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase
- Secure password hashing
- Protected API routes
- HTTPS-only in production

## Competition Rules

1. Sign up with the provided broker referral link
2. Create a Live TradeLocker account
3. Fund account with minimum $100
4. Connect account via the platform
5. Trade during competition period
6. Winner determined by highest percentage gain

## Support

For issues or questions, please open an issue in the repository.

## License

MIT License - feel free to use this project for your own trading competitions!
