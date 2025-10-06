"use client"

import { useState } from "react"
import type { Peak, PeakTranslation } from "@/lib/types/peak"
import { DEFAULT_LANGUAGES } from "@/lib/types/translation-config"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Sparkles } from "lucide-react"
import { deleteTranslation, generateTranslation } from "./actions"
import { useRouter } from "next/navigation"
import { TranslationDialog } from "./translation-dialog"

interface TranslationsTableProps {
  translations: (PeakTranslation & { peaks: { name: string } })[]
  peaks: Peak[]
}

export function TranslationsTable({ translations, peaks }: TranslationsTableProps) {
  const [selectedPeak, setSelectedPeak] = useState<string>("all")
  const [generating, setGenerating] = useState<string | null>(null)
  const [editingTranslation, setEditingTranslation] = useState<PeakTranslation | null>(null)
  const router = useRouter()

  const filteredTranslations =
    selectedPeak === "all" ? translations : translations.filter((t) => t.peak_id === selectedPeak)

  const handleGenerate = async (peakId: string, languageCode: string) => {
    setGenerating(`${peakId}-${languageCode}`)
    try {
      const peak = peaks.find((p) => p.id === peakId)
      if (!peak) {
        alert('Peak not found')
        return
      }

      await generateTranslation(peakId, languageCode, {
        name: peak.name,
        description: peak.description,
        region: peak.region,
      })
      router.refresh()
    } catch (error) {
      console.error("[v0] Failed to generate translation:", error)
      // Display error to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate translation'
      alert(`Error: ${errorMessage}`)
    } finally {
      setGenerating(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTranslation(id)
      router.refresh()
    } catch (error) {
      console.error("[v0] Failed to delete translation:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedPeak} onValueChange={setSelectedPeak}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by peak" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Peaks</SelectItem>
            {peaks.map((peak) => (
              <SelectItem key={peak.id} value={peak.id}>
                {peak.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peak</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTranslations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No translations found
                </TableCell>
              </TableRow>
            ) : (
              filteredTranslations.map((translation) => (
                <TableRow key={translation.id}>
                  <TableCell className="font-medium">{translation.peaks.name}</TableCell>
                  <TableCell>
                    {DEFAULT_LANGUAGES.find((l) => l.code === translation.language_code)?.name ||
                      translation.language_code}
                  </TableCell>
                  <TableCell>{translation.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {translation.is_auto_translated && (
                        <Badge variant="secondary">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      {translation.is_moderated && <Badge variant="default">Moderated</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingTranslation(translation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(translation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Generate New Translation</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Select value={selectedPeak === "all" ? "" : selectedPeak} onValueChange={setSelectedPeak}>
            <SelectTrigger>
              <SelectValue placeholder="Select a peak" />
            </SelectTrigger>
            <SelectContent>
              {peaks.map((peak) => (
                <SelectItem key={peak.id} value={peak.id}>
                  {peak.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2">
            {DEFAULT_LANGUAGES.map((lang) => {
              const exists = translations.some((t) => t.peak_id === selectedPeak && t.language_code === lang.code)
              const isGenerating = generating === `${selectedPeak}-${lang.code}`

              return (
                <Button
                  key={lang.code}
                  size="sm"
                  variant={exists ? "secondary" : "default"}
                  disabled={!selectedPeak || selectedPeak === "all" || exists || isGenerating}
                  onClick={() => handleGenerate(selectedPeak, lang.code)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isGenerating ? "Generating..." : lang.name}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {editingTranslation && (
        <TranslationDialog translation={editingTranslation} onClose={() => setEditingTranslation(null)} />
      )}
    </div>
  )
}
