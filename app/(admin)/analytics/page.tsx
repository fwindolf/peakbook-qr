import { getUserMetrics, getPeakMetrics, getActivityData } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mountain, TrendingUp, UserX } from "lucide-react"
import { ActivityChart } from "./activity-chart"
import { TopPeaksChart } from "./top-peaks-chart"

export default async function AnalyticsPage() {
  const [userMetrics, peakMetrics, activityData] = await Promise.all([
    getUserMetrics(),
    getPeakMetrics(),
    getActivityData(30),
  ])

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">Track user engagement and peak performance metrics</p>
      </div>

      {/* User Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userMetrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userMetrics.mau.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userMetrics.wau.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userMetrics.dau.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highly Engaged</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userMetrics.highlyEngagedUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">5+ entries in 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userMetrics.inactiveUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">No activity in 30 days</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Peak Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Peak Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Peaks</CardTitle>
              <Mountain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{peakMetrics.totalPeaks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">In database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visited Peaks</CardTitle>
              <Mountain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{peakMetrics.peaksWithEntries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">With at least 1 entry</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unvisited Peaks</CardTitle>
              <Mountain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{peakMetrics.unvisitedPeaks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">No entries yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Entries/Peak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{peakMetrics.averageEntriesPerPeak.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">Average visits per peak</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Over Time</CardTitle>
          <CardDescription>Daily entries and unique users (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityChart data={activityData} />
        </CardContent>
      </Card>

      {/* Top Peaks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Peaks</CardTitle>
            <CardDescription>Peaks with the most visits</CardDescription>
          </CardHeader>
          <CardContent>
            {peakMetrics.topPeaks.length > 0 ? (
              <div className="space-y-3">
                {peakMetrics.topPeaks.map((peak) => (
                  <div key={peak.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{peak.name}</p>
                      <p className="text-sm text-muted-foreground">{peak.uniqueVisitors} unique visitors</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{peak.totalVisits}</p>
                      <p className="text-xs text-muted-foreground">visits</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No peak data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unpopular Peaks</CardTitle>
            <CardDescription>Peaks with few visits that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {peakMetrics.unpopularPeaks.length > 0 ? (
              <div className="space-y-3">
                {peakMetrics.unpopularPeaks.map((peak) => (
                  <div key={peak.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{peak.name}</p>
                      <p className="text-sm text-muted-foreground">{peak.uniqueVisitors} unique visitors</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{peak.totalVisits}</p>
                      <p className="text-xs text-muted-foreground">visits</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No unpopular peaks found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
