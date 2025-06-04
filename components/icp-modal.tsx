"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, ChevronRight, ChevronLeft, Save, Info, CheckCircle, Loader2 } from "lucide-react"
import type { ICP, CustomParameter, ParameterOutputScoringType } from "@/types/icp"
import { cn } from "@/lib/utils"

const MAX_CUSTOM_PARAMETERS = 10
const OUTPUT_SCORING_TYPES = ["Score Range", "Binary", "Number", "String"]

interface ICPModalProps {
  isOpen: boolean
  onClose: () => void
  icp?: ICP | null
  onSave: (
    icp: Omit<ICP, "id" | "assistantId" | "systemPrompt" | "createdAt" | "updatedAt" | "dateModified"> | ICP,
  ) => void
  isSaving?: boolean
}

export function ICPModal({ isOpen, onClose, icp, onSave, isSaving = false }: ICPModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [icpName, setIcpName] = useState("")
  const [icpDescription, setIcpDescription] = useState("")
  const [customParameters, setCustomParameters] = useState<CustomParameter[]>([])

  useEffect(() => {
    if (isOpen) {
      if (icp) {
        setIcpName(icp.name || "")
        setIcpDescription(icp.description || "")
        setCustomParameters(
          (icp.customParameters || []).map((p) => {
            const type = p.scoringType || "Score Range"
            return {
              ...p,
              scoringType: type,
              scoringMin: type === "Score Range" ? (p.scoringMin === undefined ? 1 : p.scoringMin) : undefined,
              scoringMax: type === "Score Range" ? (p.scoringMax === undefined ? 100 : p.scoringMax) : undefined,
            }
          }),
        )
      } else {
        setIcpName("")
        setIcpDescription("")
        setCustomParameters([])
      }
      setCurrentStep(1)
    }
  }, [isOpen, icp])

  const handleAddParameter = () => {
    if (customParameters.length < MAX_CUSTOM_PARAMETERS) {
      setCustomParameters([
        ...customParameters,
        {
          id: `temp-${Date.now()}`,
          parameterName: "",
          parameterDescription: "",
          scoringType: "Score Range",
          scoringMin: 1,
          scoringMax: 100,
        },
      ])
    }
  }

  const handleRemoveParameter = (id: string) => {
    setCustomParameters(customParameters.filter((param) => param.id !== id))
  }

  const handleParameterChange = (id: string, field: keyof CustomParameter, value: string | number) => {
    setCustomParameters(customParameters.map((param) => (param.id === id ? { ...param, [field]: value } : param)))
  }

  const handleScoringConfigChange = (
    id: string,
    field: "scoringType" | "scoringMin" | "scoringMax",
    value: string | number,
  ) => {
    setCustomParameters(
      customParameters.map((param) => {
        if (param.id === id) {
          const updatedParam = { ...param, [field]: value }
          if (field === "scoringType") {
            if (value !== "Score Range") {
              updatedParam.scoringMin = undefined
              updatedParam.scoringMax = undefined
            } else {
              updatedParam.scoringMin = updatedParam.scoringMin === undefined ? 1 : updatedParam.scoringMin
              updatedParam.scoringMax = updatedParam.scoringMax === undefined ? 100 : updatedParam.scoringMax
            }
          }

          if (updatedParam.scoringType === "Score Range") {
            const min = Number(updatedParam.scoringMin)
            const max = Number(updatedParam.scoringMax)
            if (field === "scoringMin" && !isNaN(min) && !isNaN(max) && min > max) {
              updatedParam.scoringMax = min
            }
            if (field === "scoringMax" && !isNaN(min) && !isNaN(max) && max < min) {
              updatedParam.scoringMin = max
            }
          }
          return updatedParam
        }
        return param
      }),
    )
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 2))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const isStep1Valid = () => {
    return (
      (icpName || "").trim() !== "" &&
      (icpDescription || "").trim() !== "" &&
      customParameters.every((p) => (p.parameterName || "").trim() !== "")
    )
  }

  const isStep2Valid = () => {
    return customParameters.every((p) => {
      if (p.scoringType === "Score Range") {
        return (
          p.scoringMin !== undefined &&
          p.scoringMax !== undefined &&
          String(p.scoringMin || "").trim() !== "" &&
          String(p.scoringMax || "").trim() !== "" &&
          Number(p.scoringMin) <= Number(p.scoringMax)
        )
      }
      return true
    })
  }

  const handleSubmit = () => {
    if (!isStep1Valid() || !isStep2Valid()) return

    const finalICP: ICP = {
      id: icp?.id || Date.now().toString(),
      name: icpName,
      description: icpDescription,
      customParameters: customParameters.map((p) => ({
        ...p,
        scoringMin: p.scoringType === "Score Range" ? Number(p.scoringMin) : undefined,
        scoringMax: p.scoringType === "Score Range" ? Number(p.scoringMax) : undefined,
      })),
      dateModified: new Date().toISOString().split("T")[0],
      color:
        icp?.color || (["blue", "green", "purple", "orange", "pink"][Math.floor(Math.random() * 5)] as ICP["color"]),
    }
    onSave(finalICP)
    onClose()
  }

  const getOutputTypeDescription = (type: ParameterOutputScoringType) => {
    switch (type) {
      case "Score Range":
        return "Numerical score within a defined range"
      case "Binary":
        return "Yes/No or True/False output"
      case "Number":
        return "Any numerical value"
      case "String":
        return "Text-based descriptive output"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-gray-900 border-white/20 text-white shadow-2xl rounded-xl">
        <DialogHeader className="px-8 pt-8 pb-4 flex-shrink-0">
          <DialogTitle className="text-3xl font-bold text-white">{icp ? "Edit ICP" : "Create New ICP"}</DialogTitle>
          <DialogDescription className="text-blue-200 text-base">
            Guide your company scoring by defining precise Ideal Customer Profile attributes and their scoring logic.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 mb-6 flex-shrink-0">
          <div className="flex items-center w-full bg-white/5 p-1 rounded-lg">
            {[1, 2].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => {
                  if (stepNum < currentStep && isStep1Valid()) setCurrentStep(stepNum)
                  if (stepNum > currentStep && currentStep === 1 && isStep1Valid()) setCurrentStep(stepNum)
                }}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2",
                  currentStep === stepNum
                    ? "bg-blue-500/20 text-blue-300 shadow-md"
                    : currentStep > stepNum
                      ? "text-green-400 hover:bg-white/10"
                      : "text-white/60 hover:bg-white/10",
                  stepNum > currentStep &&
                    currentStep === 1 &&
                    !isStep1Valid() &&
                    "cursor-not-allowed opacity-60 hover:bg-transparent",
                )}
                disabled={stepNum > currentStep && currentStep === 1 && !isStep1Valid()}
              >
                {currentStep > stepNum ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs",
                      currentStep === stepNum ? "border-blue-400 text-blue-400" : "border-white/40 text-white/40",
                    )}
                  >
                    {stepNum}
                  </span>
                )}
                {["Define Parameters", "Configure Scoring"][stepNum - 1]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto min-h-0 px-8 pb-8 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-white/10">
          {currentStep === 1 && (
            <div className="space-y-8">
              <Card className="card-gradient border-white/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">ICP Foundation</CardTitle>
                  <CardDescription className="text-blue-200">
                    Define the core name and description for this ICP.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="icpName" className="text-white font-medium text-base">
                      ICP Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="icpName"
                      value={icpName}
                      onChange={(e) => setIcpName(e.target.value)}
                      placeholder="e.g., High-Growth SaaS Startups"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 text-base p-3"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="icpDescription" className="text-white font-medium text-base">
                      Description <span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="icpDescription"
                      value={icpDescription}
                      onChange={(e) => setIcpDescription(e.target.value)}
                      placeholder="Detailed description of this Ideal Customer Profile, its goals, and target characteristics..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[120px] text-base p-3"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient border-white/10 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl text-white">Custom Parameters</CardTitle>
                      <CardDescription className="text-blue-200">
                        Add specific attributes to refine your ICP definition.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddParameter}
                      disabled={customParameters.length >= MAX_CUSTOM_PARAMETERS}
                      className="secondary-button h-10 px-4"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add ({customParameters.length}/{MAX_CUSTOM_PARAMETERS})
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {customParameters.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-lg">
                      <Info className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                      <p className="text-base text-blue-200">No custom parameters added yet.</p>
                      <p className="text-sm text-white/60">Click "Add" to define specific attributes.</p>
                    </div>
                  )}
                  {customParameters.map((param, index) => (
                    <div
                      key={param.id}
                      className="p-6 rounded-lg border border-white/10 bg-white/5 space-y-5 relative shadow-md"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveParameter(param.id)}
                        className="absolute top-3 right-3 h-8 w-8 text-red-400/70 hover:text-red-400 hover:bg-red-500/20"
                        aria-label="Remove parameter"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="space-y-3">
                        <Label htmlFor={`paramName-${param.id}`} className="text-white/90 text-base">
                          Parameter Name {index + 1} <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id={`paramName-${param.id}`}
                          value={param.parameterName || ""}
                          onChange={(e) => handleParameterChange(param.id, "parameterName", e.target.value)}
                          placeholder={`e.g., Annual Revenue, Team Size`}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-base p-3"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor={`paramDesc-${param.id}`} className="text-white/90 text-base">
                          Parameter Description
                        </Label>
                        <Textarea
                          id={`paramDesc-${param.id}`}
                          value={param.parameterDescription || ""}
                          onChange={(e) => handleParameterChange(param.id, "parameterDescription", e.target.value)}
                          placeholder="Describe what this parameter measures and why it's important..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[80px] text-base p-3"
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <Card className="card-gradient border-white/10 shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl text-white">Default Outputs</CardTitle>
                  <CardDescription className="text-blue-200">
                    These outputs are standard for all ICP analyses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  <div className="p-6 rounded-lg border border-white/10 bg-white/5">
                    <h4 className="font-semibold text-white text-lg">Overall Score</h4>
                    <p className="text-base text-blue-200">Range: 1 - 100 (Fixed)</p>
                  </div>
                  <div className="p-6 rounded-lg border border-white/10 bg-white/5">
                    <h4 className="font-semibold text-white text-lg">Scoring Reason</h4>
                    <p className="text-base text-blue-200">
                      A qualitative explanation for the overall score (Generated during analysis).
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient border-white/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Custom Parameter Scoring</CardTitle>
                  <CardDescription className="text-blue-200">
                    Define the output type and scoring logic for your custom parameters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {customParameters.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-lg">
                      <Info className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                      <p className="text-base text-blue-200">No custom parameters to configure.</p>
                      <p className="text-sm text-white/60">Add parameters in Step 1 to define their scoring here.</p>
                    </div>
                  )}
                  {customParameters.map((param) => (
                    <div
                      key={param.id}
                      className="p-6 rounded-lg border border-white/10 bg-white/5 space-y-6 shadow-md"
                    >
                      <div>
                        <h4 className="font-semibold text-white text-xl mb-1">
                          {param.parameterName || "Unnamed Parameter"}
                        </h4>
                        <p className="text-sm text-blue-200 line-clamp-3">
                          {param.parameterDescription || "No description provided in Step 1."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label htmlFor={`scoringType-${param.id}`} className="text-white/90 text-base">
                            Output Type
                          </Label>
                          <Select
                            value={param.scoringType}
                            onValueChange={(value) =>
                              handleScoringConfigChange(param.id, "scoringType", value as ParameterOutputScoringType)
                            }
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white text-base p-3 h-auto">
                              <SelectValue placeholder="Select output type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-white/20 text-white">
                              {OUTPUT_SCORING_TYPES.map((type) => (
                                <SelectItem key={type} value={type} className="text-base hover:bg-white/10">
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">{type}</span>
                                    <span className="text-xs text-blue-300">{getOutputTypeDescription(type)}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-blue-300">{getOutputTypeDescription(param.scoringType)}</p>
                        </div>

                        {param.scoringType === "Score Range" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                            <div className="space-y-3">
                              <Label htmlFor={`scoringMin-${param.id}`} className="text-white/90 text-base">
                                Min Score
                              </Label>
                              <Input
                                id={`scoringMin-${param.id}`}
                                type="number"
                                value={param.scoringMin ?? ""}
                                onChange={(e) => handleScoringConfigChange(param.id, "scoringMin", e.target.value)}
                                className="bg-white/10 border-white/20 text-white text-base p-3"
                                placeholder="e.g., 1"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor={`scoringMax-${param.id}`} className="text-white/90 text-base">
                                Max Score
                              </Label>
                              <Input
                                id={`scoringMax-${param.id}`}
                                type="number"
                                value={param.scoringMax ?? ""}
                                onChange={(e) => handleScoringConfigChange(param.id, "scoringMax", e.target.value)}
                                className="bg-white/10 border-white/20 text-white text-base p-3"
                                placeholder="e.g., 100"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {param.scoringType === "Score Range" &&
                        param.scoringMin !== undefined &&
                        param.scoringMax !== undefined &&
                        (String(param.scoringMin || "").trim() === "" ||
                          String(param.scoringMax || "").trim() === "") && (
                          <p className="text-sm text-yellow-400 pt-1">
                            Min and Max scores are required for Score Range.
                          </p>
                        )}
                      {param.scoringType === "Score Range" &&
                        param.scoringMin !== undefined &&
                        param.scoringMax !== undefined &&
                        String(param.scoringMin || "").trim() !== "" &&
                        String(param.scoringMax || "").trim() !== "" &&
                        Number(param.scoringMin) > Number(param.scoringMax) && (
                          <p className="text-sm text-red-400 pt-1">Min score cannot be greater than max score.</p>
                        )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="px-8 pt-6 pb-8 border-t border-white/10 bg-gray-900 flex justify-between items-center flex-shrink-0">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="secondary-button h-11 px-6 text-base"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="secondary-button h-11 px-6 text-base">
              Cancel
            </Button>
            {currentStep === 2 ? (
              <Button
                onClick={handleSubmit}
                className="primary-button h-11 px-6 text-base"
                disabled={!isStep1Valid() || !isStep2Valid() || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {icp ? "Update ICP" : "Create ICP"}
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={nextStep} className="primary-button h-11 px-6 text-base" disabled={!isStep1Valid()}>
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
