"use client"

import type React from "react"

import { useState } from "react"
import { DEFAULT_LANGUAGES } from "@/lib/types/translation-config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTranslationConfig, saveTranslationConfig } from "../actions"
import { Plus, X } from "lucide-react"

export function TranslationConfigForm() {
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGES[0].code)
  const [loading, setLoading] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [formData, setFormData] = useState({
    brand_voice: "",
    tone: "",
    style_guidelines: "",
    terminology: {} as Record<string, string>,
  })
  const [newTerm, setNewTerm] = useState({ key: "", value: "" })

  const loadConfig = async (languageCode: string) => {
    setLoadingConfig(true)
    try {
      const config = await getTranslationConfig(languageCode)
      if (config) {
        setFormData({
          brand_voice: config.brand_voice,
          tone: config.tone,
          style_guidelines: config.style_guidelines,
          terminology: config.terminology || {},
        })
      } else {
        setFormData({
          brand_voice: "",
          tone: "",
          style_guidelines: "",
          terminology: {},
        })
      }
    } catch (error) {
      console.error("[v0] Failed to load config:", error)
    } finally {
      setLoadingConfig(false)
    }
  }

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode)
    loadConfig(languageCode)
  }

  const handleAddTerm = () => {
    if (newTerm.key && newTerm.value) {
      setFormData({
        ...formData,
        terminology: {
          ...formData.terminology,
          [newTerm.key]: newTerm.value,
        },
      })
      setNewTerm({ key: "", value: "" })
    }
  }

  const handleRemoveTerm = (key: string) => {
    const { [key]: _, ...rest } = formData.terminology
    setFormData({ ...formData, terminology: rest })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const language = DEFAULT_LANGUAGES.find((l) => l.code === selectedLanguage)
      await saveTranslationConfig({
        language_code: selectedLanguage,
        language_name: language?.name || selectedLanguage,
        ...formData,
      })
      alert("Configuration saved successfully!")
    } catch (error) {
      console.error("[v0] Failed to save config:", error)
      alert("Failed to save configuration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Language</CardTitle>
          <CardDescription>Choose a language to configure translation settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loadingConfig ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Loading configuration...</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Brand Voice</CardTitle>
              <CardDescription>Define the overall personality and character of the brand</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.brand_voice}
                onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                placeholder="e.g., Adventurous, inspiring, and community-focused. We celebrate the joy of mountain exploration."
                rows={3}
                disabled={loading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tone</CardTitle>
              <CardDescription>Specify the emotional quality of the communication</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                placeholder="e.g., Friendly, informative, enthusiastic"
                disabled={loading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Style Guidelines</CardTitle>
              <CardDescription>Provide specific writing style instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.style_guidelines}
                onChange={(e) => setFormData({ ...formData, style_guidelines: e.target.value })}
                placeholder="e.g., Use active voice, keep sentences concise, avoid technical jargon"
                rows={4}
                disabled={loading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terminology</CardTitle>
              <CardDescription>Define specific terms and their translations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {Object.entries(formData.terminology).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Input value={key} disabled className="flex-1" />
                    <span className="text-muted-foreground">→</span>
                    <Input value={value} disabled className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTerm(key)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="term-key">Term</Label>
                  <Input
                    id="term-key"
                    value={newTerm.key}
                    onChange={(e) => setNewTerm({ ...newTerm, key: e.target.value })}
                    placeholder="e.g., summit"
                    disabled={loading}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="term-value">Translation</Label>
                  <Input
                    id="term-value"
                    value={newTerm.value}
                    onChange={(e) => setNewTerm({ ...newTerm, value: e.target.value })}
                    placeholder="e.g., Gipfel"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTerm}
                  disabled={loading || !newTerm.key || !newTerm.value}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </>
      )}
    </form>
  )
}
