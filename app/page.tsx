"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Mock data
const runningTasks = [
  {
    id: 1,
    name: "Enterprise SaaS Analysis",
    icp: "Enterprise Tech Companies",
    progress: 65,
    startTime: "2 hours ago",
    estimatedCompletion: "45 min remaining",
  },
]

const completedTasks = [
  {
    id: 1,
    name: "Q4 Lead Analysis",
    icp: "Mid-Market SaaS",
    runtime: "12 min",
    startDate: "2024-01-15",
    companies: 450,
    avgScore: 78.2,
  },
  {
    id: 2,
    name: "Healthcare Prospects",
    icp: "Healthcare Tech",
    runtime: "8 min",
    startDate: "2024-01-14",
    companies: 320,
    avgScore: 65.8,
  },
  {
    id: 3,
    name: "Fintech Analysis",
    icp: "Financial Services",
    runtime: "15 min",
    startDate: "2024-01-13",
    companies: 280,
    avgScore: 82.1,
  },
]

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("running")

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push("/dashboard")
      } else {
        // User is not authenticated, redirect to login
        router.push("/login")
      }
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    </div>
  )
}
