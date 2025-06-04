"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileText, CheckCircle, AlertCircle, Zap, Settings2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useToast } from "@/hooks/use-toast"
import { getICPsFromSupabase } from "@/lib/icp-service"
import { useTaskStore } from "@/lib/task-store"
import { TaskModal } from "@/components/task-modal"
import { useRouter } from "next/navigation"
import type { ICP } from "@/types/icp"

export default function MatcherPage() {
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [selectedICP, setSelectedICP] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [icps, setIcps] = useState<ICP[]>([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const { toast } = useToast()
  const { addTask, simulateTaskProgress } = useTaskStore()
  const router = useRouter()

  // Load ICPs from service on component mount
  useEffect(() => {
    const loadICPs = async () => {
      const fetchedICPs = await getICPsFromSupabase()
      setIcps(fetchedICPs)
    }
    loadICPs()
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        // Validate file
        if (file.size > 50 * 1024 * 1024) {
          // 50MB limit
          toast({
            title: "File too large",
            description: "Please upload a file smaller than 50MB",
            variant: "destructive",
          })
          return
        }

        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          status: "valid",
        })

        toast({
          title: "File uploaded successfully",
          description: `${file.name} is ready for analysis`,
        })
      }
    },
    [toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
  })

  const handleAnalysisClick = () => {
    if (!uploadedFile || !selectedICP) {
      toast({
        title: "Missing requirements",
        description: "Please upload a file and select an ICP profile",
        variant: "destructive",
      })
      return
    }
    setShowTaskModal(true)
  }

  const handleTaskSubmit = (taskName: string) => {
    setIsAnalyzing(true)

    const selectedICPData = icps.find((icp) => icp.id === selectedICP)

    // Create the task
    const taskId = addTask({
      name: taskName,
      icp: selectedICPData?.name || "Unknown ICP",
      fileName: uploadedFile.name,
      status: "running",
      progress: 0,
      startTime: "Just now",
      estimatedCompletion: "Calculating...",
    })

    // Start simulating progress
    simulateTaskProgress(taskId)

    // Close modal and show success
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowTaskModal(false)

      toast({
        title: "Analysis started",
        description: `Task "${taskName}" has been queued and will appear in the dashboard`,
      })

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    }, 1000)
  }

  const downloadTemplate = () => {
    // Create a simple CSV template with only Company Name and Company Website
    const csvContent =
      "Company Name,Company Website\nExample Corp,example.com\nTech Solutions Inc,techsolutions.com\nInnovate LLC,innovate.com"
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prospectiq-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const selectedICPData = icps.find((icp) => icp.id === selectedICP)

  return (
    <SidebarInset className="gradient-bg">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6 backdrop-blur-sm bg-white/5">
        <SidebarTrigger className="-ml-1 text-white hover:bg-white/10" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold text-white">ICP Matcher</h1>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" onClick={downloadTemplate} className="secondary-button">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button onClick={handleAnalysisClick} disabled={!uploadedFile || !selectedICP} className="primary-button">
            <Zap className="h-4 w-4 mr-2" />
            Run Analysis
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        {/* CSV Upload Zone */}
        <Card className="card-gradient border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Upload Company Data
            </CardTitle>
            <CardDescription className="text-blue-200">
              Upload a CSV or Excel file with company information (max 50MB). Use our template for the correct format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-blue-400 bg-blue-500/10 scale-105"
                  : uploadedFile
                    ? "border-green-400 bg-green-500/10"
                    : "border-white/20 hover:border-blue-400 hover:bg-blue-500/5"
              }`}
            >
              <input {...getInputProps()} />

              {uploadedFile ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-full bg-green-500/20 w-fit mx-auto">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-400 text-lg">{uploadedFile.name}</p>
                    <p className="text-sm text-blue-200">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Badge className="mt-3 bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready for Analysis
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-full bg-blue-500/20 w-fit mx-auto">
                    <Upload className="h-12 w-12 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">
                      {isDragActive ? "Drop your file here" : "Drop CSV or click to upload"}
                    </p>
                    <p className="text-sm text-blue-200 mt-2">Supports .csv and .xlsx files up to 50MB</p>
                    <p className="text-xs text-blue-300 mt-1">Required columns: Company Name, Company Website</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ICP Selection */}
        <Card className="card-gradient border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-400" />
              Analysis Configuration
            </CardTitle>
            <CardDescription className="text-blue-200">
              Select the ICP profile to match against your companies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <Label htmlFor="icp-select" className="text-white font-medium text-base">
                ICP Profile <span className="text-red-400">*</span>
              </Label>
              <Select value={selectedICP} onValueChange={setSelectedICP}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select an ICP profile" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {icps.length === 0 ? (
                    <SelectItem value="no-icps" disabled className="text-white/60">
                      No ICPs available - Create one first
                    </SelectItem>
                  ) : (
                    icps.map((icp) => (
                      <SelectItem key={icp.id} value={icp.id} className="text-white hover:bg-white/10">
                        {icp.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {icps.length === 0 && (
                <p className="text-sm text-yellow-400">
                  No ICP profiles found. Please create an ICP profile first in the "My ICPs" section.
                </p>
              )}
            </div>

            {selectedICPData && (
              <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                <h4 className="font-medium text-white text-base mb-2">{selectedICPData.name}</h4>
                <p className="text-sm text-blue-200 mb-3">{selectedICPData.description}</p>
                <div className="flex items-center gap-4 text-xs text-blue-300">
                  <span>Parameters: {selectedICPData.customParameters.length}</span>
                  <span>Last Updated: {selectedICPData.dateModified}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Preview */}
        {uploadedFile && selectedICP && selectedICPData && (
          <Card className="card-gradient border-white/10 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                Analysis Preview
              </CardTitle>
              <CardDescription className="text-blue-200">Review your configuration before running</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-effect rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Data File</p>
                      <p className="text-sm text-blue-200">{uploadedFile.name}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-500/20">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">ICP Profile</p>
                      <p className="text-sm text-blue-200">{selectedICPData.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task Naming Modal */}
      <TaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        onSubmit={handleTaskSubmit}
        isLoading={isAnalyzing}
        selectedICP={selectedICPData?.name}
        fileName={uploadedFile?.name}
      />
    </SidebarInset>
  )
}
