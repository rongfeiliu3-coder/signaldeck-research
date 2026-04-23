import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="surface mx-auto max-w-2xl p-8 text-center">
      <p className="section-heading">{t.notFound.title}</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">{t.notFound.body}</h1>
      <Link href="/" className="focus-ring mt-6 inline-flex rounded-lg border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-medium text-cyan">
        {t.notFound.action}
      </Link>
    </div>
  );
}
