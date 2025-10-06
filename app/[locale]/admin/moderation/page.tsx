import { getModerationStats, getPendingEntries, getUntranslatedPeaks } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageModerationQueue } from "./image-moderation-queue"
import { TranslationQueue } from "./translation-queue"
import { AlertCircle, CheckCircle, Globe, ImageIcon } from "lucide-react"

export default async function ModerationPage() {
  const [stats, pendingEntries, untranslatedPeaks] = await Promise.all([
    getModerationStats(),
    getPendingEntries(),
    getUntranslatedPeaks(),
  ])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Moderation Dashboard</h1>
        <p className="text-muted-foreground mt-2">Review and approve user-submitted content</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Images</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingImages}</div>
            <p className="text-xs text-muted-foreground">{stats.totalEntries} total entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEntries > 0
                ? Math.round(((stats.totalEntries - stats.pendingImages) / stats.totalEntries) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Images approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translation Queue</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.peaksNeedingTranslation}</div>
            <p className="text-xs text-muted-foreground">Peaks need translations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peaks</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPeaks}</div>
            <p className="text-xs text-muted-foreground">In the database</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="images" className="space-y-4">
        <TabsList>
          <TabsTrigger value="images">Image Moderation ({stats.pendingImages})</TabsTrigger>
          <TabsTrigger value="translations">Translation Queue ({stats.peaksNeedingTranslation})</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4">
          <ImageModerationQueue entries={pendingEntries} />
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <TranslationQueue peaks={untranslatedPeaks} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
