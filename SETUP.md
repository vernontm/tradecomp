# Setup Guide

This guide will walk you through setting up the Trading Competition platform from scratch.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Fill in project details:
   - Name: Trading Competition
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Wait for the project to be created

### Run Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the schema

### Configure Authentication

1. Go to Authentication > Providers
2. Enable Email provider (enabled by default)
3. (Optional) Enable Google OAuth:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

### Get API Credentials

1. Go to Settings > API
2. Copy your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key

## Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_TRADELOCKER_API_URL=https://api.tradelocker.com
VITE_REFERRAL_LINK=https://plexytrade.com/?t=TBZp1B&term=register
```

## Step 4: Create Admin User

After setting up the database and running the app:

1. Sign up for a new account through the UI
2. Go to Supabase dashboard > Table Editor > users
3. Find your user record
4. Set `is_admin` to `true`
5. Refresh the app - you should now see the Admin Panel

## Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## Step 6: Deploy to Vercel

### Install Vercel CLI

```bash
npm i -g vercel
```

### Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy? Yes
- Which scope? (select your account)
- Link to existing project? No
- Project name? trading-competition
- Directory? ./
- Override settings? No

### Configure Environment Variables

In Vercel dashboard:
1. Go to your project > Settings > Environment Variables
2. Add all variables from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TRADELOCKER_API_URL`
   - `VITE_REFERRAL_LINK`
3. Redeploy the project

## Step 7: Configure Supabase for Production

1. In Supabase dashboard, go to Authentication > URL Configuration
2. Add your Vercel deployment URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that RLS policies are properly set up
- Ensure the schema was executed successfully

### Authentication Issues
- Check that auth providers are enabled in Supabase
- Verify redirect URLs are configured correctly
- Clear browser cache and cookies

### TradeLocker API Issues
- Verify API endpoint is correct
- Check that credentials are valid
- Ensure CORS is properly configured

## Testing the Application

1. **Sign Up**: Create a new user account
2. **Login**: Test email/password login
3. **Connect Account**: Add TradeLocker credentials (use demo account for testing)
4. **View Dashboard**: Check that stats display correctly
5. **Check Leaderboard**: Verify rankings are calculated properly
6. **Admin Panel**: Test competition settings (if admin)

## Next Steps

- Customize the referral link in competition settings
- Set competition start and end dates
- Invite participants to join
- Monitor the leaderboard during the competition

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure the database schema was applied successfully
