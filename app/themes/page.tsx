import { FolderKanban } from "lucide-react";
import { ThemeScoreCard } from "@/components/theme-score-card";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getResearchWorkspace } from "@/lib/research/workspace";

export default async function ThemesPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const workspace = await getResearchWorkspace();

  return (
    <div className="space-y-6">
      <section className="surface-strong p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 text-sm text-cyan">
          <FolderKanban className="h-4 w-4" />
          {t.themeResearch.eyebrow}
        </div>
        <h1 className="mt-4 page-title">{t.themeResearch.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{t.themeResearch.description}</p>
        <p className="mt-3 text-sm text-slate-500">{t.themeResearch.configHint}</p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {workspace.themes.map((theme) => (
          <ThemeScoreCard key={theme.slug} theme={theme} locale={locale} />
        ))}
      </section>
    </div>
  );
}
