"use client"

import { useState } from "react"
import Link from "next/link"
import type { Peak } from "@/lib/types/peak"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, QrCode, Search } from "lucide-react"
import { deletePeak } from "./actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PeaksTableProps {
  peaks: Peak[]
}

export function PeaksTable({ peaks }: PeaksTableProps) {
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const filteredPeaks = peaks.filter(
    (peak) =>
      peak.name.toLowerCase().includes(search.toLowerCase()) ||
      peak.country.toLowerCase().includes(search.toLowerCase()) ||
      peak.region.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await deletePeak(id)
      router.refresh()
    } catch (error) {
      console.error("[v0] Failed to delete peak:", error)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search peaks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Altitude</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeaks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No peaks found
                </TableCell>
              </TableRow>
            ) : (
              filteredPeaks.map((peak) => (
                <TableRow key={peak.id}>
                  <TableCell className="font-medium">{peak.name}</TableCell>
                  <TableCell>
                    {peak.region}, {peak.country}
                  </TableCell>
                  <TableCell>{peak.altitude}m</TableCell>
                  <TableCell className="font-mono text-sm">
                    {peak.latitude.toFixed(4)}, {peak.longitude.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/qr-codes?peakId=${peak.id}`}>
                          <QrCode className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/peaks/${peak.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={deleting === peak.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Peak</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {peak.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(peak.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
