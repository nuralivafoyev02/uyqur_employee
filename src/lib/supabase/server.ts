import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv, getSupabaseServiceEnv } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

function buildServerClient() {
  const { url, publishableKey, configured } = getSupabasePublicEnv();

  if (!configured) {
    return null;
  }

  return { url, publishableKey };
}

export async function createServerComponentClient() {
  const env = buildServerClient();

  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies; the proxy keeps sessions fresh.
        }
      },
    },
  });
}

export async function createActionClient() {
  const env = buildServerClient();

  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export function createAdminClient() {
  const env = getSupabaseServiceEnv();

  if (!env.configured) {
    return null;
  }

  return createClient<Database>(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function updateSupabaseSession(request: NextRequest) {
  const env = buildServerClient();

  if (!env) {
    return {
      response: NextResponse.next({
        request,
      }),
      user: null,
    };
  }

  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
