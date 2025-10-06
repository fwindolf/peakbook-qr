import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "de"],
  defaultLocale: "de",
})

export type Locale = (typeof routing.locales)[number]
export const locales = routing.locales
export const defaultLocale = routing.defaultLocale
