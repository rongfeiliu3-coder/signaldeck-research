import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BookMarked, FileText, FolderKanban, PieChart, Sigma, Sparkles, Zap } from "lucide-react";
import "./globals.css";
import { LanguageToggle } from "@/components/language-toggle";
import { NavLink } from "@/components/nav-link";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Quantize A-share Research Workspace",
  description: "A-share theme rotation, sector diagnostics, fundamentals, fund research, and opportunity lab."
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
    { href: "/strategies", label: t.nav.strategies, icon: Zap },
    { href: "/reports", label: t.nav.reports, icon: FileText },
    { href: "/opportunities", label: t.nav.opportunities, icon: Sparkles },
    { href: "/themes", label: t.nav.themes, icon: FolderKanban },
    { href: "/fundamentals", label: t.nav.fundamentals, icon: Sigma },
    { href: "/funds", label: t.nav.funds, icon: PieChart }
  ];

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} className="dark">
      <body className="antialiased selection:bg-cyan/30 selection:text-white">
        <div className="app-shell flex flex-col">
          <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-ink/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
              <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-90">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan shadow-[0_0_15px_rgba(94,223,255,0.15)]">
                  <BookMarked className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="hidden sm:block">
                  <span className="block text-sm font-bold tracking-tight text-white leading-none">QUANTIZE</span>
                  <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 leading-none">{t.nav.subtitle}</span>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-1 rounded-lg border border-white/[0.05] bg-white/[0.02] p-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        className="focus-ring flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-white/[0.05] hover:text-white"
                        activeClassName="bg-white/[0.1] text-cyan !text-cyan"
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="hidden lg:inline">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
                <div className="h-4 w-px bg-white/10" />
                <LanguageToggle locale={locale} />
              </div>
            </div>
          </header>
          
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </main>

          <footer className="border-t border-white/[0.05] bg-black/20 px-4 py-6 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600 sm:px-6">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <p>{t.footer.disclaimer}</p>
              </div>
              <p className="text-slate-500">{t.footer.roadmap}</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
