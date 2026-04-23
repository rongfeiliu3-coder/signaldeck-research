import { cookies } from "next/headers";
import { Locale, defaultLocale } from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("signaldeck-locale")?.value;
  return locale === "en" || locale === "zh" ? locale : defaultLocale;
}
