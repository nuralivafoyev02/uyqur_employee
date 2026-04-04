import { NextResponse, type NextRequest } from "next/server";

import { createActionClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl;
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  const redirectUrl = new URL(next, requestUrl.origin);
  const loginUrl = new URL("/login", requestUrl.origin);

  const supabase = await createActionClient();

  if (!supabase) {
    loginUrl.searchParams.set("authError", "supabase_not_ready");
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as
        | "signup"
        | "invite"
        | "magiclink"
        | "recovery"
        | "email_change"
        | "email",
    });

    if (!error) {
      return NextResponse.redirect(redirectUrl);
    }
  }

  loginUrl.searchParams.set("authError", "confirmation_failed");
  return NextResponse.redirect(loginUrl);
}
