"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPendingEntries() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("peak_entries")
    .select("*, peaks(name), profiles(username)")
    .eq("image_approved", false)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching pending entries:", error)
    throw new Error("Failed to fetch pending entries")
  }

  return data
}

export async function approveEntry(entryId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("peak_entries")
    .update({
      image_approved: true,
      moderated_by: user?.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", entryId)

  if (error) {
    console.error("[v0] Error approving entry:", error)
    throw new Error("Failed to approve entry")
  }

  revalidatePath("/moderation")
}

export async function rejectEntry(entryId: string, reason?: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("peak_entries")
    .update({
      image_approved: false,
      image_url: null,
      photo_url: null,
      moderated_by: user?.id,
      moderated_at: new Date().toISOString(),
      notes: reason || "Image rejected by moderator",
    })
    .eq("id", entryId)

  if (error) {
    console.error("[v0] Error rejecting entry:", error)
    throw new Error("Failed to reject entry")
  }

  revalidatePath("/moderation")
}

export async function getUntranslatedPeaks() {
  const supabase = await getSupabaseServerClient()

  // Get all peaks
  const { data: peaks, error: peaksError } = await supabase
    .from("peaks")
    .select("id, name, description, region")
    .order("created_at", { ascending: false })

  if (peaksError) {
    console.error("[v0] Error fetching peaks:", peaksError)
    throw new Error("Failed to fetch peaks")
  }

  // Get all translations
  const { data: translations, error: translationsError } = await supabase
    .from("peak_translations")
    .select("peak_id, language_code")

  if (translationsError) {
    console.error("[v0] Error fetching translations:", translationsError)
    throw new Error("Failed to fetch translations")
  }

  // Calculate missing translations
  const supportedLanguages = ["en", "de", "fr", "it", "es", "nl", "pl", "cs"]
  const peaksWithMissingTranslations = peaks.map((peak) => {
    const existingTranslations = translations?.filter((t) => t.peak_id === peak.id).map((t) => t.language_code) || []

    const missingLanguages = supportedLanguages.filter((lang) => !existingTranslations.includes(lang))

    return {
      ...peak,
      missingLanguages,
      translationProgress: Math.round((existingTranslations.length / supportedLanguages.length) * 100),
    }
  })

  return peaksWithMissingTranslations.filter((p) => p.missingLanguages.length > 0)
}

export async function getModerationStats() {
  const supabase = await getSupabaseServerClient()

  const [pendingEntries, totalEntries, untranslatedPeaks, totalPeaks] = await Promise.all([
    supabase
      .from("peak_entries")
      .select("id", { count: "exact", head: true })
      .eq("image_approved", false)
      .not("image_url", "is", null),
    supabase.from("peak_entries").select("id", { count: "exact", head: true }),
    getUntranslatedPeaks(),
    supabase.from("peaks").select("id", { count: "exact", head: true }),
  ])

  return {
    pendingImages: pendingEntries.count || 0,
    totalEntries: totalEntries.count || 0,
    peaksNeedingTranslation: untranslatedPeaks.length,
    totalPeaks: totalPeaks.count || 0,
  }
}
