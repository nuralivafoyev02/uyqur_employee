import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_SETUP_MESSAGE, getSupabasePublicEnv } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createSupabaseBrowserClient() {
  const { url, publishableKey, configured } = getSupabasePublicEnv();

  if (!configured) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  browserClient ??= createBrowserClient<Database>(url, publishableKey);

  return browserClient;
}
