"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateText } from "ai"

export async function getTranslations(peakId?: string) {
  const supabase = await getSupabaseServerClient()

  let query = supabase.from("peaks_translations").select("*, peaks(name)").order("created_at", { ascending: false })

  if (peakId) {
    query = query.eq("peak_id", peakId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching translations:", error)
    throw new Error("Failed to fetch translations")
  }

  return data
}

export async function getTranslationConfig(languageCode: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("translation_configs")
    .select("*")
    .eq("language_code", languageCode)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error fetching translation config:", error)
  }

  return data
}

export async function saveTranslationConfig(config: {
  language_code: string
  language_name: string
  brand_voice: string
  tone: string
  style_guidelines: string
  terminology: Record<string, string>
}) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("translation_configs")
    .upsert(config, { onConflict: "language_code" })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error saving translation config:", error)
    throw new Error("Failed to save translation config")
  }

  revalidatePath("/translations/config")
  return data
}

export async function generateTranslation(
  peakId: string,
  languageCode: string,
  sourceText: {
    name: string
    description: string
    region: string
  },
) {
  const supabase = await getSupabaseServerClient()

  // Get translation config for the language
  const config = await getTranslationConfig(languageCode)

  const systemPrompt = config
    ? `You are a professional translator for peakbook, a mountain peak tracking app.
    
Brand Voice: ${config.brand_voice}
Tone: ${config.tone}
Style Guidelines: ${config.style_guidelines}

${
  Object.keys(config.terminology).length > 0
    ? `Terminology to use:
${Object.entries(config.terminology)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}`
    : ""
}

Translate the following peak information to ${config.language_name}. Maintain the brand voice and style.
Return ONLY a JSON object with keys: name, description, region. No markdown, no code blocks.`
    : `You are a professional translator for peakbook, a mountain peak tracking app.
Translate the following peak information to the target language naturally and accurately.
Return ONLY a JSON object with keys: name, description, region. No markdown, no code blocks.`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `${systemPrompt}

Source text:
Name: ${sourceText.name}
Description: ${sourceText.description}
Region: ${sourceText.region}`,
    })

    const translated = JSON.parse(text)

    // Save translation to database
    const { data, error } = await supabase
      .from("peaks_translations")
      .insert({
        peak_id: peakId,
        language_code: languageCode,
        name: translated.name,
        description: translated.description,
        region: translated.region,
        is_auto_translated: true,
        translation_source: "openai/gpt-4o-mini",
        translation_metadata: {
          config_used: config ? config.language_code : null,
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving translation:", error)
      throw new Error("Failed to save translation")
    }

    revalidatePath("/translations")
    return data
  } catch (error) {
    console.error("[v0] Error generating translation:", error)
    throw new Error("Failed to generate translation")
  }
}

export async function updateTranslation(
  id: string,
  updates: {
    name: string
    description: string
    region: string
  },
) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("peaks_translations")
    .update({
      ...updates,
      is_auto_translated: false,
      is_moderated: true,
      moderated_by: user?.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating translation:", error)
    throw new Error("Failed to update translation")
  }

  revalidatePath("/translations")
  return data
}

export async function deleteTranslation(id: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from("peaks_translations").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting translation:", error)
    throw new Error("Failed to delete translation")
  }

  revalidatePath("/translations")
}
