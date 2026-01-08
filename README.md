# Trading Competition - Whop App

A trading competition platform embedded in Whop that connects with TradeLocker accounts to track and rank traders based on their percentage gains.

## Whop Integration

This app is designed to be embedded in Whop using the Whop SDK. It provides:
- **Experience View** (`/experiences/[experienceId]`) - For customers to access the trading competition
- **Dashboard View** (`/dashboard/[companyId]`) - For admins to manage the competition
- **Discover View** (`/discover`) - Landing page for the app

## Setup Instructions

### 1. Create a Whop App

1. Go to the [Whop Developer Dashboard](https://whop.com/dashboard/developer)
2. Create a new app or select an existing one
3. In the **Hosting** section, configure:
   - **Base URL**: Your deployment domain (e.g., `https://your-app.vercel.app`)
   - **App path**: `/experiences/[experienceId]`
   - **Dashboard path**: `/dashboard/[companyId]`
   - **Discover path**: `/discover`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# From Whop Developer Dashboard
NEXT_PUBLIC_WHOP_APP_ID=app_xxxxxxxx
WHOP_API_KEY=your_whop_api_key
WHOP_WEBHOOK_SECRET=your_webhook_secret

# From Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TradeLocker
TRADELOCKER_API_KEY=your_tradelocker_api_key
```

### 3. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 4. Run Development Server

```bash
npm run dev
```

The dev server uses the Whop proxy for local development. In the Whop iframe, click the settings icon and select "localhost" to test locally.

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Import to [Vercel](https://vercel.com/new)
3. Add environment variables
4. Update your Whop app's Base URL to your Vercel domain

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── tradelocker-auth/   # TradeLocker authentication
│   │   ├── tradelocker-accounts/ # Fetch TradeLocker accounts
│   │   └── refresh-balances/   # Refresh all balances (cron)
│   ├── dashboard/[companyId]/  # Admin dashboard (Whop Dashboard View)
│   ├── discover/               # App discovery page (Whop Discover View)
│   ├── experiences/[experienceId]/ # Main app (Whop Experience View)
│   ├── layout.tsx              # Root layout with WhopApp wrapper
│   └── page.tsx                # Home page
├── components/
│   ├── pages/                  # Page components
│   ├── AdminDashboard.tsx      # Admin dashboard component
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── TradingApp.tsx          # Main trading app component
└── lib/
    ├── supabase.ts             # Supabase client
    └── whop-sdk.ts             # Whop SDK configuration
```

## Features

- **Leaderboard**: Rankings based on percentage gain
- **Account Connection**: Connect TradeLocker accounts
- **Auto-sync**: Balances updated every 15 minutes
- **Admin Panel**: Manage users and accounts (Dashboard View)
- **Whop Authentication**: Users authenticated via Whop
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Trading API**: TradeLocker
- **Platform**: Whop SDK
- **Deployment**: Vercel
- **Icons**: Lucide React

## Database Schema

### Tables

- **users**: User profiles (synced with Whop users)
- **trading_accounts**: TradeLocker account credentials and balances
- **competition_settings**: Competition dates and referral links

### Views

- **leaderboard_view**: Calculated rankings with profit/loss percentages

## Competition Rules

1. Sign up with the provided broker referral link
2. Create a Live TradeLocker account
3. Fund account with minimum $100
4. Connect account via the platform
5. Trade during competition period
6. Winner determined by highest percentage gain

## License

MIT License
