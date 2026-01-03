/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TRADELOCKER_API_KEY: string
  readonly VITE_REFERRAL_LINK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
