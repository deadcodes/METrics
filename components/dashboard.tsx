"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserSelector } from "@/components/user-selector"
import { MetricsOverview } from "@/components/metrics-overview"
import type { HydratedLogEntry } from "@/lib/types"
import { Skeleton } from "./ui/skeleton"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { StackedAreaChart } from "@/components/stacked-area-chart"
import { TimeRangeSelector, type TimeRange } from "@/components/time-range-selector"
import { getPathFromDB, setPathInDB } from "@/db/dao"
import { getAllUsersHydratedLogData, getHydratedUserLogData, scanDirectory } from "@/lib/logfiles"
import { ClearLogButton } from "./clear-log-button"
import { ToastContextProvider } from "./ui/toast-context"
import { ItemDetails } from "./item-details"

let logfileDir: string
interface DashboardProps {
  dir: string
}

export function Dashboard({dir} : DashboardProps) {
  const [users, setUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("all") // Default to "all"
  const [entries, setEntries] = useState<HydratedLogEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<HydratedLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDirectory, setSelectedDirectory] = useState(dir)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isDirectoryPromptOpen, setIsDirectoryPromptOpen] = useState(false)
  const [isDirectoryInputOpen, setIsDirectoryInputOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>({ label: "All", seconds: 0 })

  // Calculate overview metrics from entries
  const overviewMetrics = useMemo(() => {
    if (!filteredEntries.length) {
      return {
        totalEntries: 0,
        uniqueItems: 0,
        goldValue: 0,
        lastUpdated: new Date().toISOString(),
      }
    }

    const rawGold = filteredEntries.filter(d => d.itemId === 995)
    const goldValue = rawGold.reduce((sum, entry) => sum + entry.quantity, 0)
    const uniqueItems = new Set(filteredEntries.map((entry) => entry.itemId)).size
    const lastUpdated = new Date(Math.max(...filteredEntries.map((entry) => entry.timestamp * 1000))).toISOString()
    return {
      totalEntries: filteredEntries.length,
      uniqueItems,
      goldValue,
      lastUpdated,
    }
  }, [filteredEntries])

  // Filter entries based on selected time range
  useEffect(() => {
    if (!entries.length) {
      setFilteredEntries([])
      return
    }

    // If timeRange.seconds is 0, return all data
    if (timeRange.seconds === 0) {
      setFilteredEntries(entries)
      return
    }

    const now = Math.floor(Date.now() / 1000)
    const cutoffTime = now - timeRange.seconds

    // Filter entries
    const filtered = entries.filter((entry) => entry.timestamp >= cutoffTime)
    setFilteredEntries(filtered)
  }, [entries, timeRange, selectedUser])

  const loadSettings = async () => {
    const settings = await getPathFromDB()
    console.log('db settings', settings)
    if (settings) {
      if (settings.length > 0) {
        logfileDir = settings
        setSelectedDirectory(settings)
        handleDirectorySelect(settings)
        setSelectedUser("all")
      }
    } else {
      setIsDirectoryPromptOpen(true)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleDirectorySelect = async (path: string) => {
    try {
      setIsLoading(true)
      if (path.length == 0) return
      setSelectedDirectory(path)
      const availableUsers = await scanDirectory(path)
      setUsers(availableUsers)
      console.log('handleDirectorySelect', path, availableUsers)
      if (availableUsers.length > 0) {
        if (path !== logfileDir) {
          setPathInDB(path)
        }
      }
      // Always select "all" users by default
      handleUserChange("all")

      setIsDirectoryPromptOpen(false)
    } catch (error: any) {
      console.error("Error scanning directory:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectoryUpdate = async (newDirectory: string) => {
    if (newDirectory !== logfileDir) {
      setPathInDB(newDirectory)
    }
    logfileDir = newDirectory
    setIsDirectoryInputOpen(false)
    await handleDirectorySelect(newDirectory)
  }

  const handleUserChange = async (user: string) => {
    try {
      setIsLoading(true)
      setSelectedUser(user)
      let lines: HydratedLogEntry[] = []
      if (user === 'all') {
        lines = await getAllUsersHydratedLogData(logfileDir)
      } else {
        console.log('calling getHydratedUserLogData', logfileDir, user)
        lines = await getHydratedUserLogData(logfileDir, user)
      }
      setEntries(lines)
      setLastUpdated(new Date())
    } catch (error: any) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async (user: string = selectedUser) => {
    if (!selectedDirectory) return null
    handleUserChange(user)
  }

  useEffect(() => {
    if (!selectedDirectory) return

    const intervalId = setInterval(async () => {
      await refreshData()
    }, 300000)

    return () => clearInterval(intervalId)
  }, [selectedUser, selectedDirectory, refreshData])

  const handleLogCleared = async () => {
    await refreshData()
  }

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
  }

  return (
    <ToastContextProvider>
      <ScrollArea className="flex flex-col h-screen dark:bg-background">
        <header className="border-b dark:border-border">
          <div className="flex h-16 text-foreground items-center px-4 md:px-6">
            <FileText className="h-6 w-6 mr-2" />
            <h1 className="text-xl text-foreground font-semibold">User Log Metrics Dashboard</h1>
            <div className="ml-auto flex items-center gap-2">
              {/* <ThemeToggle /> */}
              {users.length > 0 && (
                <>
                  <UserSelector users={users} selectedUser={selectedUser} onUserChange={handleUserChange} />
                  <ClearLogButton
                    username={selectedUser}
                    directory={selectedDirectory}
                    onSuccess={handleLogCleared}
                    disabled={isLoading || selectedUser === "all"}
                  />
                </>
              )}
              <Button className="text-foreground" variant="outline" onClick={() => setIsDirectoryInputOpen(true)}>
                Update Directory
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {isDirectoryPromptOpen ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Enter Log Directory</CardTitle>
                  <CardDescription>Please enter the path to the directory containing user log files.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const directory = formData.get("directory") as string
                      if (directory) {
                        handleDirectorySelect(directory)
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Input name="directory" placeholder="Enter directory path" defaultValue={selectedDirectory} />
                      <Button className="text-foreground" type="submit">Set</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : !filteredEntries ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Loading...</CardTitle>
                  <CardDescription>Scanning directory and loading user data.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg text-foreground font-semibold">
                    {selectedUser === "all" ? "All Users" : selectedUser + "'s"} Activity
                  </h2>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {isLoading ? (
                      <div className="space-y-2 mt-2">
                        <Skeleton className="h-3 w-[200px]" />
                      </div>
                    ) : (
                      <span>
                        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        <span className="mx-2">•</span>
                        <span>Directory: {selectedDirectory}</span>
                      </span>
                    )}

                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  {isLoading ? (
                    <div className="space-y-2 mt-2">
                      <Skeleton className="h-3 w-[600px]" />
                    </div>
                  ) : (
                    <TimeRangeSelector selectedRange={timeRange} onRangeChange={handleTimeRangeChange} />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshData()}
                    disabled={isLoading}
                    className="ml-auto text-foreground"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 text-foreground ${isLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>
              <MetricsOverview data={overviewMetrics} entries={filteredEntries} />
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Income Over Time</CardTitle>
                    <CardDescription>GP earned over time, computed in 5 minute intervals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StackedAreaChart entries={filteredEntries} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Heatmap</CardTitle>
                    <CardDescription>Distribution of activity by day of week and hour of day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityHeatmap data={filteredEntries} />
                  </CardContent>
                </Card>
              </div>
              <ItemDetails entries={filteredEntries} />
            </div>
          )}
          {isDirectoryInputOpen && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Update Log Directory</CardTitle>
                  <CardDescription>Enter the new path to the directory containing user log files.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const directory = formData.get("directory") as string
                      if (directory) {
                        handleDirectoryUpdate(directory)
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Input name="directory" placeholder="Enter directory path" defaultValue={selectedDirectory} />
                      <Button className="text-foreground" type="submit">Update</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </ScrollArea >
    </ToastContextProvider>
  )
}

