"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Peak, PeakFormData } from "@/lib/types/peak"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPeak, updatePeak } from "./actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PeakFormProps {
  peak?: Peak
}

export function PeakForm({ peak }: PeakFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<PeakFormData>({
    name: peak?.name || "",
    description: peak?.description || "",
    altitude: peak?.altitude || 0,
    latitude: peak?.latitude || 0,
    longitude: peak?.longitude || 0,
    country: peak?.country || "",
    region: peak?.region || "",
    image_url: peak?.image_url || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (peak) {
        await updatePeak(peak.id, formData)
      } else {
        await createPeak(formData)
      }
      router.push("/peaks")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/peaks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Peaks
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Peak Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
                placeholder="e.g., Zugspitze"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altitude">Altitude (meters) *</Label>
              <Input
                id="altitude"
                type="number"
                value={formData.altitude}
                onChange={(e) => setFormData({ ...formData, altitude: Number.parseFloat(e.target.value) })}
                required
                disabled={loading}
                placeholder="e.g., 2962"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={loading}
              rows={4}
              placeholder="Describe the peak..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                disabled={loading}
                placeholder="e.g., Germany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
                disabled={loading}
                placeholder="e.g., Bavaria"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              disabled={loading}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Coordinates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number.parseFloat(e.target.value) })}
                required
                disabled={loading}
                placeholder="e.g., 47.4211"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number.parseFloat(e.target.value) })}
                required
                disabled={loading}
                placeholder="e.g., 10.9853"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : peak ? "Update Peak" : "Create Peak"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/peaks">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
