import { getPeaks } from "./actions"
import { PeaksTable } from "./peaks-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function PeaksPage() {
  const peaks = await getPeaks()

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Peaks</h1>
          <p className="text-muted-foreground mt-2">Manage mountain peaks and their information</p>
        </div>
        <Button asChild>
          <Link href="/peaks/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Peak
          </Link>
        </Button>
      </div>

      <PeaksTable peaks={peaks} />
    </div>
  )
}
