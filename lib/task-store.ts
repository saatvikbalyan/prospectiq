import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Task {
  id: string
  name: string
  icp: string
  fileName: string
  status: "running" | "completed" | "failed"
  progress: number
  startTime: string
  estimatedCompletion?: string
  runtime?: string
  companies?: number
  avgScore?: number
  createdAt: string
  completedAt?: string
}

interface TaskStore {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "createdAt">) => string
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  getRunningTasks: () => Task[]
  getCompletedTasks: () => Task[]
  simulateTaskProgress: (id: string) => void
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (taskData) => {
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const task: Task = {
          ...taskData,
          id,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          tasks: [...state.tasks, task],
        }))

        return id
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },

      getRunningTasks: () => {
        return get().tasks.filter((task) => task.status === "running")
      },

      getCompletedTasks: () => {
        return get()
          .tasks.filter((task) => task.status === "completed")
          .sort(
            (a, b) =>
              new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime(),
          )
      },

      simulateTaskProgress: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task || task.status !== "running") return

        const interval = setInterval(
          () => {
            const currentTask = get().tasks.find((t) => t.id === id)
            if (!currentTask || currentTask.status !== "running") {
              clearInterval(interval)
              return
            }

            const newProgress = Math.min(currentTask.progress + Math.random() * 15, 100)

            if (newProgress >= 100) {
              // Complete the task
              get().updateTask(id, {
                progress: 100,
                status: "completed",
                completedAt: new Date().toISOString(),
                runtime: `${Math.floor(Math.random() * 15) + 5} min`,
                companies: Math.floor(Math.random() * 500) + 100,
                avgScore: Math.floor(Math.random() * 30) + 60,
                estimatedCompletion: undefined,
              })
              clearInterval(interval)
            } else {
              // Update progress
              const remainingTime = Math.floor((100 - newProgress) / 10) + Math.floor(Math.random() * 5)
              get().updateTask(id, {
                progress: newProgress,
                estimatedCompletion: `${remainingTime} min remaining`,
              })
            }
          },
          2000 + Math.random() * 3000,
        ) // Random interval between 2-5 seconds
      },
    }),
    {
      name: "task-store",
    },
  ),
)
