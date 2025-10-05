import { getTranslations } from "./actions"
import { getPeaks } from "../peaks/actions"
import { TranslationsTable } from "./translations-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings } from "lucide-react"

export default async function TranslationsPage() {
  const [translations, peaks] = await Promise.all([getTranslations(), getPeaks()])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Translations</h1>
          <p className="text-muted-foreground mt-2">Manage multilingual content for peaks</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/translations/config">
            <Settings className="h-4 w-4 mr-2" />
            Translation Settings
          </Link>
        </Button>
      </div>

      <TranslationsTable translations={translations} peaks={peaks} />
    </div>
  )
}
