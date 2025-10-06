"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface DashboardMetrics {
  totalPeaks: number
  peaksGrowth: string
  totalUsers: number
  usersGrowth: string
  totalEntries: number
  entriesGrowth: string
  pendingModeration: number
}

export interface RecentActivity {
  id: string
  type: "peak_added" | "entry_added" | "user_signup" | "user_followed"
  message: string
  timestamp: string
  timeAgo: string
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await getSupabaseServerClient()

  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Total peaks
  const { count: totalPeaks } = await supabase.from("peaks").select("*", { count: "exact", head: true })

  // Peaks from last month for growth calculation
  const { count: peaksLastMonth } = await supabase
    .from("peaks")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthAgo.toISOString())

  const peaksGrowth =
    totalPeaks && peaksLastMonth && totalPeaks > peaksLastMonth
      ? `+${Math.round((peaksLastMonth / (totalPeaks - peaksLastMonth)) * 100)}%`
      : "+0%"

  // Total users (profiles)
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Users from last month
  const { count: usersLastMonth } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthAgo.toISOString())

  const usersGrowth =
    totalUsers && usersLastMonth && totalUsers > usersLastMonth
      ? `+${Math.round((usersLastMonth / (totalUsers - usersLastMonth)) * 100)}%`
      : "+0%"

  // Total entries
  const { count: totalEntries } = await supabase.from("peak_entries").select("*", { count: "exact", head: true })

  // Entries from last month
  const { count: entriesLastMonth } = await supabase
    .from("peak_entries")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthAgo.toISOString())

  const entriesGrowth =
    totalEntries && entriesLastMonth && totalEntries > entriesLastMonth
      ? `+${Math.round((entriesLastMonth / (totalEntries - entriesLastMonth)) * 100)}%`
      : "+0%"

  // Pending moderation (unapproved images)
  const { count: pendingModeration } = await supabase
    .from("peak_entries")
    .select("*", { count: "exact", head: true })
    .eq("image_approved", false)
    .not("photo_url", "is", null)

  return {
    totalPeaks: totalPeaks || 0,
    peaksGrowth,
    totalUsers: totalUsers || 0,
    usersGrowth,
    totalEntries: totalEntries || 0,
    entriesGrowth,
    pendingModeration: pendingModeration || 0,
  }
}

function getTimeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  }
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const supabase = await getSupabaseServerClient()
  const activities: RecentActivity[] = []

  // Get recent peaks
  const { data: recentPeaks } = await supabase
    .from("peaks")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  recentPeaks?.forEach((peak) => {
    activities.push({
      id: `peak-${peak.id}`,
      type: "peak_added",
      message: `New peak added: ${peak.name}`,
      timestamp: peak.created_at,
      timeAgo: getTimeAgo(peak.created_at),
    })
  })

  // Get recent entries
  const { data: recentEntries } = await supabase
    .from("peak_entries")
    .select("id, created_at, user_id, peaks(name), profiles(profile_name, public)")
    .order("created_at", { ascending: false })
    .limit(5)

  recentEntries?.forEach((entry: any) => {
    const userName =
      entry.profiles?.public && entry.profiles?.profile_name ? entry.profiles.profile_name : "A user"
    activities.push({
      id: `entry-${entry.id}`,
      type: "entry_added",
      message: `${userName} added entry for ${entry.peaks?.name || "a peak"}`,
      timestamp: entry.created_at,
      timeAgo: getTimeAgo(entry.created_at),
    })
  })

  // Get recent user signups
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, profile_name, public, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  recentUsers?.forEach((user) => {
    const displayName = user.public && user.profile_name ? user.profile_name : "Anonymous"
    activities.push({
      id: `user-${user.id}`,
      type: "user_signup",
      message: `New user signed up: ${displayName}`,
      timestamp: user.created_at,
      timeAgo: getTimeAgo(user.created_at),
    })
  })

  // Get recent follows
  const { data: recentFollows } = await supabase
    .from("follows")
    .select("id, created_at, follower:follower_id(profile_name, public), following:following_id(profile_name, public)")
    .order("created_at", { ascending: false })
    .limit(5)

  recentFollows?.forEach((follow: any) => {
    const followerName =
      follow.follower?.public && follow.follower?.profile_name ? follow.follower.profile_name : "A user"
    const followingName =
      follow.following?.public && follow.following?.profile_name ? follow.following.profile_name : "someone"
    activities.push({
      id: `follow-${follow.id}`,
      type: "user_followed",
      message: `${followerName} followed ${followingName}`,
      timestamp: follow.created_at,
      timeAgo: getTimeAgo(follow.created_at),
    })
  })

  // Sort all activities by timestamp and return top 10
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
}
