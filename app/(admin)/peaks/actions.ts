"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PeakFormData } from "@/lib/types/peak"

export async function getPeaks() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("peaks").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching peaks:", error)
    throw new Error("Failed to fetch peaks")
  }

  return data
}

export async function getPeakById(id: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("peaks").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching peak:", error)
    throw new Error("Failed to fetch peak")
  }

  return data
}

export async function createPeak(formData: PeakFormData) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await supabase
    .from("peaks")
    .insert({
      ...formData,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating peak:", error)
    throw new Error("Failed to create peak")
  }

  revalidatePath("/peaks")
  return data
}

export async function updatePeak(id: string, formData: PeakFormData) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("peaks").update(formData).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating peak:", error)
    throw new Error("Failed to update peak")
  }

  revalidatePath("/peaks")
  revalidatePath(`/peaks/${id}`)
  return data
}

export async function deletePeak(id: string) {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase.from("peaks").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting peak:", error)
    throw new Error("Failed to delete peak")
  }

  revalidatePath("/peaks")
}
