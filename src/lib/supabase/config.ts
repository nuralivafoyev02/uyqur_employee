const PLACEHOLDER_URL = "your-project-url";
const PLACEHOLDER_KEY = "your-key";

export const SUPABASE_SETUP_MESSAGE =
  "Supabase konfiguratsiyasi topilmadi. `.env.local` ichiga haqiqiy project URL va publishable key kiriting.";

function normalizeEnv(value: string | undefined) {
  return value?.trim() ?? "";
}

export function getSupabasePublicEnv() {
  const url = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey =
    normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) ||
    normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const configured =
    url.length > 0 &&
    publishableKey.length > 0 &&
    !url.includes(PLACEHOLDER_URL) &&
    !publishableKey.includes(PLACEHOLDER_KEY);

  return {
    url,
    publishableKey,
    configured,
  };
}

export function isSupabaseConfigured() {
  return getSupabasePublicEnv().configured;
}
