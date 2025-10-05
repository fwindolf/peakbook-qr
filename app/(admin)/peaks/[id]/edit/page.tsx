import { getPeakById } from "../../actions"
import { PeakForm } from "../../peak-form"
import { notFound } from "next/navigation"

export default async function EditPeakPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let peak
  try {
    peak = await getPeakById(id)
  } catch {
    notFound()
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Peak</h1>
        <p className="text-muted-foreground mt-2">Update peak information</p>
      </div>

      <PeakForm peak={peak} />
    </div>
  )
}
