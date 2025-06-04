"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (taskName: string) => void
  isLoading?: boolean
  selectedICP?: string
  fileName?: string
}

export function TaskModal({ open, onOpenChange, onSubmit, isLoading = false, selectedICP, fileName }: TaskModalProps) {
  const [taskName, setTaskName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (taskName.trim()) {
      onSubmit(taskName.trim())
      setTaskName("")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setTaskName("")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Zap className="h-5 w-5 text-blue-400" />
            Name Your Analysis Task
          </DialogTitle>
          <DialogDescription className="text-blue-200">
            Give your analysis task a descriptive name to easily identify it on the dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name" className="text-white">
              Task Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g., Q1 Enterprise Prospects Analysis"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {selectedICP && fileName && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
              <div className="text-sm">
                <span className="text-blue-300">ICP Profile:</span>
                <span className="ml-2 text-white">{selectedICP}</span>
              </div>
              <div className="text-sm">
                <span className="text-blue-300">Data File:</span>
                <span className="ml-2 text-white">{fileName}</span>
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="secondary-button"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!taskName.trim() || isLoading} className="primary-button">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting Analysis...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
