"use client";

import Image from "next/image";
import Link from "next/link";

import { usePreferences } from "@/components/providers/preferences-provider";
import { getAuthCopy } from "@/lib/auth-copy";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { language } = usePreferences();
  const copy = getAuthCopy(language);

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="app-shell flex min-h-screen items-center justify-center py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
          <section className="app-panel hidden p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <p className="app-kicker">{copy.layout.eyebrow}</p>
              <h1 className="text-4xl font-semibold tracking-tight text-app-text">
                {copy.layout.title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-app-text-muted">
                {copy.layout.description}
              </p>
            </div>

            <div className="app-panel-soft space-y-3 p-5">
              <p className="text-sm font-medium text-app-text">{copy.layout.featuresTitle}</p>
              <ul className="space-y-2 text-sm leading-6 text-app-text-muted">
                {copy.layout.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="app-panel p-6 sm:p-8">
            <div className="mb-8 flex items-center gap-2">
              <Image src="/uyqur-logo.jpg" alt="Logo" width={25} height={25} className="rounded-[2px]" />
              <Link href="/" className="text-sm font-semibold font-size-12 text-app-text">
                {copy.layout.brand}
              </Link>
            </div>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
