"use client"

import { useState } from "react"
import type { Peak } from "@/lib/types/peak"
import { DEFAULT_LANGUAGES } from "@/lib/types/translation-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Globe } from "lucide-react"
import { generateTranslation } from "../translations/actions"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface TranslationQueueProps {
  peaks: (Peak & { missingLanguages: string[]; translationProgress: number })[]
}

export function TranslationQueue({ peaks }: TranslationQueueProps) {
  const [generating, setGenerating] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerate = async (peak: Peak, languageCode: string) => {
    setGenerating(`${peak.id}-${languageCode}`)
    try {
      await generateTranslation(peak.id, languageCode, {
        name: peak.name,
        description: peak.description,
        region: peak.region,
      })
      router.refresh()
    } catch (error) {
      console.error("[v0] Failed to generate translation:", error)
    } finally {
      setGenerating(null)
    }
  }

  if (peaks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-medium">All peaks translated!</p>
          <p className="text-sm">Every peak has translations in all supported languages</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {peaks.map((peak) => (
        <Card key={peak.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{peak.name}</CardTitle>
                <CardDescription>
                  {peak.region}, {peak.country}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{peak.translationProgress}%</div>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={peak.translationProgress} className="h-2" />

            <div>
              <p className="text-sm font-medium mb-2">Missing Languages:</p>
              <div className="flex flex-wrap gap-2">
                {peak.missingLanguages.map((langCode) => {
                  const language = DEFAULT_LANGUAGES.find((l) => l.code === langCode)
                  const isGenerating = generating === `${peak.id}-${langCode}`

                  return (
                    <Button
                      key={langCode}
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerate(peak, langCode)}
                      disabled={isGenerating}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {isGenerating ? "Generating..." : language?.name || langCode}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/translations?peakId=${peak.id}`}>View All Translations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
