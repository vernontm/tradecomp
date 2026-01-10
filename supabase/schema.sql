-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cron job logs table
CREATE TABLE IF NOT EXISTS public.cron_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    accounts_updated INTEGER DEFAULT 0,
    accounts_total INTEGER DEFAULT 0,
    errors TEXT[],
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading accounts table
CREATE TABLE IF NOT EXISTS public.trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_type TEXT NOT NULL CHECK (account_type IN ('tradelocker')),
    tl_account_type TEXT DEFAULT 'live' CHECK (tl_account_type IN ('live', 'demo')),
    tl_email TEXT,
    tl_server TEXT,
    tl_password_encrypted TEXT,
    account_number TEXT NOT NULL,
    account_name TEXT,
    starting_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    show_on_leaderboard BOOLEAN DEFAULT TRUE,
    balance_override BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, account_number)
);

-- Competition settings table
CREATE TABLE IF NOT EXISTS public.competition_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    start_date DATE,
    end_date DATE,
    referral_link TEXT,
    prize_amount TEXT,
    prize_description TEXT,
    minimum_balance DECIMAL(15, 2) DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default competition settings
INSERT INTO public.competition_settings (id, referral_link)
VALUES (1, 'https://plexytrade.com/?t=TBZp1B&term=register')
ON CONFLICT (id) DO NOTHING;

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
    u.username,
    ta.id,
    ta.account_number,
    ta.account_name,
    ta.starting_balance,
    ta.current_balance,
    ta.currency,
    ta.is_active,
    ta.show_on_leaderboard,
    ta.last_updated,
    (ta.current_balance - ta.starting_balance) as profit,
    CASE 
        WHEN ta.starting_balance > 0 
        THEN ((ta.current_balance - ta.starting_balance) / ta.starting_balance) * 100 
        ELSE 0 
    END as percentage_change
FROM public.trading_accounts ta
JOIN public.users u ON ta.user_id = u.id
WHERE ta.show_on_leaderboard = TRUE
ORDER BY percentage_change DESC;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_logs ENABLE ROW LEVEL SECURITY;

-- Cron logs policies
CREATE POLICY "Admins can view cron logs"
    ON public.cron_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_admin = TRUE
        )
    );

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users during signup"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Trading accounts policies
CREATE POLICY "Users can view their own trading account"
    ON public.trading_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trading account"
    ON public.trading_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading account"
    ON public.trading_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading account"
    ON public.trading_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Admin can view all trading accounts
CREATE POLICY "Admins can view all trading accounts"
    ON public.trading_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_admin = TRUE
        )
    );

-- Competition settings policies
CREATE POLICY "Everyone can view competition settings"
    ON public.competition_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can update competition settings"
    ON public.competition_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.is_admin = TRUE
        )
    );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, username, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        FALSE
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON public.trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_balances ON public.trading_accounts(current_balance, starting_balance);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
