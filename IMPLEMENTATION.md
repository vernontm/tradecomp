# Implementation Guide

Follow these steps to get your trading competition app up and running.

## Step 1: Create Your .env File

Copy the example environment file and it will have your credentials:

```bash
cp .env.example .env
```

Your `.env` file should already contain:
- ✅ Supabase URL
- ✅ Supabase Anon Key
- ✅ TradeLocker API Key
- ✅ Referral Link

## Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- React & React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS
- Supabase client
- Axios
- React Router
- Lucide React (icons)

## Step 3: Set Up Supabase Database

1. Go to your Supabase project: https://krierdtovvvwgwkknghs.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase/schema.sql` in this project
5. Copy the entire contents
6. Paste into the Supabase SQL Editor
7. Click **Run** to execute the schema

This creates:
- `users` table (with admin flag)
- `trading_accounts` table
- `competition_settings` table
- `leaderboard_view` (calculated rankings)
- Row Level Security policies
- Automatic user creation trigger

## Step 4: Configure Authentication (Optional - Google OAuth)

If you want Google sign-in:

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** and enable it
3. Follow the instructions to set up OAuth credentials
4. Add your site URL to authorized domains

## Step 5: Run Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## Step 6: Create Your Admin Account

1. Open http://localhost:3000 in your browser
2. Click **Sign Up**
3. Create an account with your email
4. Go back to Supabase dashboard > **Table Editor** > **users**
5. Find your user record
6. Set `is_admin` to `true`
7. Refresh the app - you'll now see the **Admin Panel** in the sidebar

## Step 7: Configure Competition Settings

1. Log in to your app
2. Click **Admin Panel** in the sidebar
3. Set:
   - Competition start date
   - Competition end date
   - Referral link (already set to your Plexy Trade link)
4. Click **Update Settings**

## Step 8: Test Account Connection

1. Go to **Accounts** page
2. Enter TradeLocker credentials:
   - Email
   - Password
   - Server
   - Account Number
   - Check "Demo Account" if testing with demo
3. Click **Connect to TradeLocker**

## Step 9: Deploy to Vercel (Production)

When ready to deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts, then:

1. Go to Vercel dashboard
2. Navigate to your project > **Settings** > **Environment Variables**
3. Add all variables from your `.env` file
4. Redeploy

## Troubleshooting

### Dependencies won't install
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
These are expected before running `npm install`. They'll disappear after installation.

### Database connection fails
- Verify your Supabase URL and anon key in `.env`
- Check that the schema was executed successfully
- Ensure RLS policies are enabled

### TradeLocker authentication fails
- Verify your API key is correct
- Check that you're using the right URL (demo vs live)
- Ensure credentials are valid

### Can't see Admin Panel
- Make sure you set `is_admin = true` in the users table
- Log out and log back in
- Clear browser cache

## Next Steps

1. ✅ Test the complete user flow
2. ✅ Invite participants to sign up
3. ✅ Monitor the leaderboard
4. ✅ Manage competition settings
5. ✅ Deploy to production when ready

## Support

Check these files for more information:
- `README.md` - Project overview
- `SETUP.md` - Detailed setup instructions
- `supabase/schema.sql` - Database structure
