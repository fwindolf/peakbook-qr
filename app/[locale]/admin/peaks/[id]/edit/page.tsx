import { getPeakById, getPeakTranslations } from "../../actions"
import { PeakForm } from "../../peak-form"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Languages, Plus } from "lucide-react"
import Link from "next/link"

export default async function EditPeakPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let peak
  let translations
  try {
    [peak, translations] = await Promise.all([
      getPeakById(id),
      getPeakTranslations(id)
    ])
  } catch {
    notFound()
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Peak</h1>
        <p className="text-muted-foreground mt-2">Update peak information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PeakForm peak={peak} />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Translations
              </CardTitle>
              <CardDescription>
                Manage translations for this peak
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {translations.length > 0 ? (
                <>
                  {translations.map((translation: any) => (
                    <div
                      key={translation.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div>
                        <p className="font-medium text-sm">{translation.language_code.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{translation.name}</p>
                      </div>
                      {translation.is_auto_translated && (
                        <span className="text-xs text-muted-foreground">Auto</span>
                      )}
                    </div>
                  ))}
                  <Link href={`/translations?peak=${id}`} className="block">
                    <Button variant="outline" className="w-full" size="sm">
                      <Languages className="mr-2 h-4 w-4" />
                      Manage Translations
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">No translations yet</p>
                  <Link href={`/translations?peak=${id}`}>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Translation
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
