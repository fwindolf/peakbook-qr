export interface TranslationConfig {
  id: string
  language_code: string
  language_name: string
  brand_voice: string
  tone: string
  style_guidelines: string
  terminology: Record<string, string>
  created_at: string
  updated_at: string
}

export interface TranslationPromptConfig {
  systemPrompt: string
  brandVoice: string
  tone: string
  styleGuidelines: string
  terminology: Record<string, string>
}

export const DEFAULT_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "it", name: "Italian" },
  { code: "es", name: "Spanish" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "cs", name: "Czech" },
]
