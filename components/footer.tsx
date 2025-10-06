import { LocaleSwitcher } from "./locale-switcher"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} peakbook</span>
            <Link href="/impressum" className="hover:text-foreground transition-colors">
              Impressum
            </Link>
          </div>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  )
}
