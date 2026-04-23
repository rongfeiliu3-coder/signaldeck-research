import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return (
    <div className="rounded-md border border-white/10 bg-panel/80 p-8">
      <h1 className="text-2xl font-semibold text-white">{t.notFound.title}</h1>
      <p className="mt-2 text-slate-400">{t.notFound.body}</p>
      <Link href="/" className="focus-ring mt-6 inline-flex rounded-md border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
        {t.notFound.action}
      </Link>
    </div>
  );
}
