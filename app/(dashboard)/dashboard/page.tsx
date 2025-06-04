"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Download, Play, CheckCircle2, BarChart3, Trash2 } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useTaskStore, type Task } from "@/lib/task-store"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("running")
  const [runningTasks, setRunningTasks] = useState<Task[]>([])
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])
  const { getRunningTasks, getCompletedTasks, deleteTask } = useTaskStore()
  const { toast } = useToast()

  // Update tasks every second to show real-time progress
  useEffect(() => {
    const updateTasks = () => {
      setRunningTasks(getRunningTasks())
      setCompletedTasks(getCompletedTasks())
    }

    updateTasks()
    const interval = setInterval(updateTasks, 1000)

    return () => clearInterval(interval)
  }, [getRunningTasks, getCompletedTasks])

  const handleDeleteTask = (taskId: string, taskName: string) => {
    deleteTask(taskId)
    toast({
      title: "Task deleted",
      description: `"${taskName}" has been removed from your dashboard`,
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  return (
    <SidebarInset className="gradient-bg">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6 backdrop-blur-sm bg-white/5">
        <SidebarTrigger className="-ml-1 text-white hover:bg-white/10" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col h-full">
        <div className="p-6 flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-6">
              <TabsTrigger
                value="running"
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-white/70"
              >
                Running Tasks ({runningTasks.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white/70"
              >
                Completed Tasks ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="running" className="space-y-4 h-full">
              {runningTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                  <div className="rounded-full bg-blue-500/20 p-6 mb-6">
                    <Play className="h-12 w-12 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">No active tasks</h3>
                  <p className="text-blue-200 mb-6 max-w-md">
                    Start matching companies against your ICPs to see real-time progress here
                  </p>
                  <Button asChild className="primary-button">
                    <Link href="/matcher">Start Matching</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {runningTasks.map((task) => (
                    <div key={task.id} className="glass-effect rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white text-lg">{task.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">
                            Running
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task.id, task.name)}
                            className="text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-blue-300">ICP Profile</p>
                          <p className="text-white font-medium">{task.icp}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-300">Data File</p>
                          <p className="text-white font-medium">{task.fileName}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-200">Progress</span>
                          <span className="font-medium text-white">{Math.round(task.progress)}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2 bg-white/10" />
                        <div className="flex items-center justify-between text-xs text-blue-300">
                          <span>Started {formatTimeAgo(task.createdAt)}</span>
                          <span>{task.estimatedCompletion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 h-full">
              {completedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                  <div className="rounded-full bg-green-500/20 p-6 mb-6">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">No completed tasks</h3>
                  <p className="text-blue-200 mb-6 max-w-md">
                    Completed analysis tasks will appear here with downloadable results
                  </p>
                  <Button asChild className="primary-button">
                    <Link href="/matcher">Start Your First Analysis</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="glass-effect rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white text-lg">{task.name}</h4>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                          <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/20">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task.id, task.name)}
                            className="text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-blue-300">ICP Used</p>
                          <p className="font-medium text-white text-sm">{task.icp}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-300">Runtime</p>
                          <p className="font-medium text-white text-sm">{task.runtime}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-300">Companies</p>
                          <p className="font-medium text-white text-sm">{task.companies}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-300">Avg Score</p>
                          <p className="font-medium text-green-400 text-sm">{task.avgScore}%</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs text-blue-300">
                          <span>Data File: {task.fileName}</span>
                          <span>Completed {formatTimeAgo(task.completedAt || task.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarInset>
  )
}
