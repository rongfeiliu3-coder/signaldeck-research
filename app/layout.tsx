import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookMarked, FolderKanban, PieChart, Sigma } from "lucide-react";
import "./globals.css";
import { LanguageToggle } from "@/components/language-toggle";
import { NavLink } from "@/components/nav-link";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Quantize A-share Research Workspace",
  description: "A-share theme rotation, sector diagnostics, fundamentals, and fund research workspace."
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
  const t = getDictionary(locale);
  const navItems = [
    { href: "/", label: t.nav.market, icon: BarChart3 },
    { href: "/themes", label: t.nav.themes, icon: FolderKanban },
    { href: "/fundamentals", label: t.nav.fundamentals, icon: Sigma },
    { href: "/funds", label: t.nav.funds, icon: PieChart }
  ];

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body>
        <div className="app-shell">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <Link href="/" className="focus-ring flex items-center gap-3 rounded-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
                  <BookMarked className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-base font-semibold text-white">Quantize</span>
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">{t.nav.subtitle}</span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <nav className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        className="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                        activeClassName="bg-white/[0.08] text-white"
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
          <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <footer className="border-t border-white/10 px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1500px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p>{t.footer.disclaimer}</p>
              <p>{t.footer.roadmap}</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
