"use client"

import { useState } from "react"
import type { PeakEntry } from "@/lib/types/peak"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check, X, Calendar } from "lucide-react"
import { approveEntry, rejectEntry } from "./actions"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ImageModerationQueueProps {
  entries: (PeakEntry & { peaks: { name: string }; profiles: { username: string } })[]
}

export function ImageModerationQueue({ entries }: ImageModerationQueueProps) {
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleApprove = async (entryId: string) => {
    setProcessing(entryId)
    try {
      await approveEntry(entryId)
      router.refresh()
    } catch (error) {
      console.error("[v0] Failed to approve entry:", error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (entryId: string) => {
    setProcessing(entryId)
    try {
      await rejectEntry(entryId, rejectReason[entryId])
      router.refresh()
    } catch (error) {
      console.error("[v0] Failed to reject entry:", error)
    } finally {
      setProcessing(null)
    }
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No pending images to review</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{entry.peaks.name}</CardTitle>
                <CardDescription>Submitted by {entry.profiles.username}</CardDescription>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {entry.image_url && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={entry.image_url || "/placeholder.svg"}
                  alt={`Entry for ${entry.peaks.name}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(entry.entry_date).toLocaleDateString()}</span>
              </div>
              {entry.note && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{entry.note}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Textarea
                placeholder="Rejection reason (optional)"
                value={rejectReason[entry.id] || ""}
                onChange={(e) => setRejectReason({ ...rejectReason, [entry.id]: e.target.value })}
                rows={2}
                disabled={processing === entry.id}
              />

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleApprove(entry.id)} disabled={processing === entry.id}>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleReject(entry.id)}
                  disabled={processing === entry.id}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
