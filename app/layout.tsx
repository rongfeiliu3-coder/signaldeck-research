import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Gauge, LineChart, Star } from "lucide-react";
import "./globals.css";
import { NavLink } from "@/components/nav-link";
import { LanguageToggle } from "@/components/language-toggle";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "SignalDeck",
  description: "A local-first quant signal dashboard and backtesting prototype."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AsyncRootLayout>{children}</AsyncRootLayout>;
}

async function AsyncRootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body>
        <LayoutContent locale={locale}>{children}</LayoutContent>
      </body>
    </html>
  );
}

async function LayoutContent({
  children,
  locale
}: Readonly<{
  children: React.ReactNode;
  locale: Awaited<ReturnType<typeof getLocale>>;
}>) {
  const t = getDictionary(locale);
  const navItems = [
    { href: "/", label: t.nav.dashboard, icon: Gauge },
    { href: "/backtest", label: t.nav.backtest, icon: LineChart },
    { href: "/watchlist", label: t.nav.watchlist, icon: Star }
  ];

  return (
    <div className="app-shell">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="focus-ring flex items-center gap-3 rounded-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-mint/30 bg-mint/10 text-mint shadow-glow">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-lg font-semibold tracking-normal text-white">SignalDeck</span>
                  <span className="block text-xs text-slate-400">{t.nav.subtitle}</span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <nav className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] p-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        className="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                        activeClassName="bg-white/8 text-white shadow-sm"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
                <LanguageToggle locale={locale} />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          <footer className="border-t border-white/10 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>{t.footer.disclaimer}</p>
              <p>{t.footer.roadmap}</p>
            </div>
          </footer>
    </div>
  );
}
