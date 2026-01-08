"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/constants/env";

type BrowserClient = ReturnType<typeof createBrowserClient>;
let client: BrowserClient | null = null;

export const getSupabaseBrowserClient = () => {
  if (!client) {
    client = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  return client;
};
