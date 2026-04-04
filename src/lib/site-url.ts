import { headers } from "next/headers";

function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrlFromEnv() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  const withProtocol =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;

  return normalizeUrl(withProtocol);
}

export async function getRequestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return normalizeUrl(origin);
  }

  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");

  if (host) {
    const protocol =
      headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

    return normalizeUrl(`${protocol}://${host}`);
  }

  return getSiteUrlFromEnv();
}
