"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Test user - always logged in
const TEST_USER: User = {
  id: "test-user-123",
  email: "test@prospectiq.com",
  name: "Test User",
  role: "Admin",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Automatically log in the test user
    setTimeout(() => {
      setUser(TEST_USER)
      setIsLoading(false)
    }, 100) // Small delay to simulate loading
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate a brief loading period
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Always succeed and log in the test user
    setUser(TEST_USER)
    setIsLoading(false)
    return true
  }

  const logout = () => {
    // Immediately log back in the test user (no actual logout)
    setUser(TEST_USER)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
