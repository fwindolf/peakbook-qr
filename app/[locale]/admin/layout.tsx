import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "peakbook Admin",
  description: "Administrative platform for managing peakbook content and operations",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen dark">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
