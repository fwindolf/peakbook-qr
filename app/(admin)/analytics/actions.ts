"use server"

import { createServerClient } from "@/lib/supabase/server"

export interface UserMetrics {
  mau: number
  wau: number
  dau: number
  totalUsers: number
  highlyEngagedUsers: number
  inactiveUsers: number
}

export interface PeakMetrics {
  totalPeaks: number
  peaksWithEntries: number
  unvisitedPeaks: number
  averageEntriesPerPeak: number
  topPeaks: Array<{
    id: string
    name: string
    totalVisits: number
    uniqueVisitors: number
  }>
  unpopularPeaks: Array<{
    id: string
    name: string
    totalVisits: number
    uniqueVisitors: number
  }>
}

export interface ActivityData {
  date: string
  entries: number
  uniqueUsers: number
}

export async function getUserMetrics(): Promise<UserMetrics> {
  const supabase = await createServerClient()

  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Total users
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // MAU - users with entries in last 30 days
  const { data: mauData } = await supabase
    .from("peak_entries")
    .select("user_id")
    .gte("created_at", monthAgo.toISOString())
    .order("user_id")

  const mau = new Set(mauData?.map((e) => e.user_id) || []).size

  // WAU - users with entries in last 7 days
  const { data: wauData } = await supabase
    .from("peak_entries")
    .select("user_id")
    .gte("created_at", weekAgo.toISOString())

  const wau = new Set(wauData?.map((e) => e.user_id) || []).size

  // DAU - users with entries in last 24 hours
  const { data: dauData } = await supabase
    .from("peak_entries")
    .select("user_id")
    .gte("created_at", dayAgo.toISOString())

  const dau = new Set(dauData?.map((e) => e.user_id) || []).size

  // Highly engaged users (5+ entries in last 30 days)
  const { data: engagedData } = await supabase
    .from("peak_entries")
    .select("user_id")
    .gte("created_at", monthAgo.toISOString())

  const userEntryCounts =
    engagedData?.reduce(
      (acc, entry) => {
        acc[entry.user_id] = (acc[entry.user_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const highlyEngagedUsers = Object.values(userEntryCounts).filter((count) => count >= 5).length

  // Inactive users (no entries in last 90 days)
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const { data: activeUserIds } = await supabase
    .from("peak_entries")
    .select("user_id")
    .gte("created_at", threeMonthsAgo.toISOString())

  const activeUsers = new Set(activeUserIds?.map((e) => e.user_id) || [])
  const inactiveUsers = (totalUsers || 0) - activeUsers.size

  return {
    mau,
    wau,
    dau,
    totalUsers: totalUsers || 0,
    highlyEngagedUsers,
    inactiveUsers: Math.max(0, inactiveUsers),
  }
}

export async function getPeakMetrics(): Promise<PeakMetrics> {
  const supabase = await createServerClient()

  // Total peaks
  const { count: totalPeaks } = await supabase.from("peaks").select("*", { count: "exact", head: true })

  // Get peak stats
  const { data: peakStats } = await supabase.from("peak_stats").select("peak_id, unique_visitors, total_visits")

  // Peaks with entries
  const peaksWithEntries = peakStats?.filter((s) => s.total_visits > 0).length || 0
  const unvisitedPeaks = (totalPeaks || 0) - peaksWithEntries

  // Average entries per peak
  const totalVisits = peakStats?.reduce((sum, s) => sum + s.total_visits, 0) || 0
  const averageEntriesPerPeak = totalPeaks ? totalVisits / totalPeaks : 0

  // Top peaks (most visited)
  const { data: topPeaksData } = await supabase
    .from("peaks")
    .select(`
      id,
      name,
      peak_stats (
        unique_visitors,
        total_visits
      )
    `)
    .order("peak_stats(total_visits)", { ascending: false })
    .limit(10)

  const topPeaks =
    topPeaksData
      ?.map((p) => ({
        id: p.id,
        name: p.name,
        totalVisits: (p.peak_stats as any)?.[0]?.total_visits || 0,
        uniqueVisitors: (p.peak_stats as any)?.[0]?.unique_visitors || 0,
      }))
      .filter((p) => p.totalVisits > 0) || []

  // Unpopular peaks (least visited, but not zero)
  const { data: unpopularPeaksData } = await supabase
    .from("peaks")
    .select(`
      id,
      name,
      peak_stats (
        unique_visitors,
        total_visits
      )
    `)
    .order("peak_stats(total_visits)", { ascending: true })
    .limit(10)

  const unpopularPeaks =
    unpopularPeaksData
      ?.map((p) => ({
        id: p.id,
        name: p.name,
        totalVisits: (p.peak_stats as any)?.[0]?.total_visits || 0,
        uniqueVisitors: (p.peak_stats as any)?.[0]?.unique_visitors || 0,
      }))
      .filter((p) => p.totalVisits > 0 && p.totalVisits < 10) || []

  return {
    totalPeaks: totalPeaks || 0,
    peaksWithEntries,
    unvisitedPeaks,
    averageEntriesPerPeak,
    topPeaks,
    unpopularPeaks,
  }
}

export async function getActivityData(days = 30): Promise<ActivityData[]> {
  const supabase = await createServerClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: entries } = await supabase
    .from("peak_entries")
    .select("created_at, user_id")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })

  // Group by date
  const activityMap = new Map<string, { entries: number; users: Set<string> }>()

  entries?.forEach((entry) => {
    const date = new Date(entry.created_at).toISOString().split("T")[0]
    if (!activityMap.has(date)) {
      activityMap.set(date, { entries: 0, users: new Set() })
    }
    const dayData = activityMap.get(date)!
    dayData.entries++
    dayData.users.add(entry.user_id)
  })

  // Fill in missing dates with zeros
  const result: ActivityData[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const dayData = activityMap.get(dateStr)
    result.push({
      date: dateStr,
      entries: dayData?.entries || 0,
      uniqueUsers: dayData?.users.size || 0,
    })
  }

  return result
}
