"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { locales, type Locale } from "@/src/i18n/routing"
import { setLocale } from "@/lib/locale-actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe } from "lucide-react"

export function LocaleSwitcher() {
  const t = useTranslations("translations.languages")
  const locale = useLocale()
  const router = useRouter()

  const handleLocaleChange = async (newLocale: string) => {
    await setLocale(newLocale as Locale)
    router.refresh()
  }

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[140px]">
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {t(loc)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
