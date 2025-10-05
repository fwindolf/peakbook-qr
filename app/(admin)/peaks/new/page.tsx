import { PeakForm } from "../peak-form"

export default function NewPeakPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Peak</h1>
        <p className="text-muted-foreground mt-2">Add a new mountain peak to the database</p>
      </div>

      <PeakForm />
    </div>
  )
}
