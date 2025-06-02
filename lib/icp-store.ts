import type { ICP } from "@/types/icp"
import { createOpenAIAssistant, updateOpenAIAssistant, deleteOpenAIAssistant } from "./openai-assistant-manager"
import { toast } from "@/hooks/use-toast" // Assuming useToast is compatible

// This would typically be replaced with a proper state management solution
// or API calls in a real application
const icpsStore: ICP[] = [
  {
    id: "1",
    name: "Enterprise Tech Companies",
    description: "Large technology companies with 500+ employees, focusing on cloud infrastructure and AI solutions.",
    dateModified: "2024-05-15",
    color: "blue",
    customParameters: [
      {
        id: "cp1",
        parameterName: "Cloud Adoption Level",
        parameterDescription: "Maturity of cloud usage (e.g., Low, Medium, High).",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 5,
      },
      {
        id: "cp2",
        parameterName: "AI Integration Projects",
        parameterDescription: "Number of active AI projects.",
        scoringType: "Number",
      },
    ],
    assistantId: "asst_existing_placeholder_1", // Placeholder
  },
  {
    id: "2",
    name: "Mid-Market SaaS",
    description: "SaaS companies with $10M-$100M revenue, typically Series B or C funded.",
    dateModified: "2024-05-14",
    color: "green",
    customParameters: [
      {
        id: "cp3",
        parameterName: "Annual Recurring Revenue (ARR)",
        parameterDescription: "Current ARR in millions.",
        scoringType: "Score Range",
        scoringMin: 10,
        scoringMax: 100,
      },
      {
        id: "cp4",
        parameterName: "Integration Ecosystem",
        parameterDescription: "Number of key integrations offered.",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 20,
      },
    ],
    assistantId: "asst_existing_placeholder_2", // Placeholder
  },
]

export const getICPs = (): ICP[] => {
  return [...icpsStore]
}

export const addICP = async (icpData: Omit<ICP, "id" | "dateModified" | "assistantId">): Promise<ICP | null> => {
  const newIcpId = Date.now().toString()
  const assistantId = await createOpenAIAssistant(icpData, newIcpId)

  if (assistantId) {
    const newIcp: ICP = {
      ...icpData,
      id: newIcpId,
      dateModified: new Date().toISOString().split("T")[0],
      assistantId: assistantId,
    }
    icpsStore.push(newIcp)
    toast({ title: "ICP Created", description: `ICP "${newIcp.name}" and its AI assistant created successfully.` })
    return newIcp
  } else {
    toast({
      title: "ICP Creation Partially Failed",
      description: `ICP "${icpData.name}" was created locally, but its AI assistant could not be created. Please try updating the ICP to create the assistant.`,
      variant: "destructive",
    })
    // Fallback: add ICP without assistant ID if assistant creation fails
    const newIcpWithoutAssistant: ICP = {
      ...icpData,
      id: newIcpId,
      dateModified: new Date().toISOString().split("T")[0],
    }
    icpsStore.push(newIcpWithoutAssistant)
    return newIcpWithoutAssistant
  }
}

export const updateICP = async (updatedIcpData: ICP): Promise<ICP | null> => {
  const index = icpsStore.findIndex((icp) => icp.id === updatedIcpData.id)
  if (index === -1) {
    toast({ title: "Error", description: "ICP not found for update.", variant: "destructive" })
    return null
  }

  let currentAssistantId = icpsStore[index].assistantId
  let assistantUpdatedOrCreated = false

  if (currentAssistantId) {
    assistantUpdatedOrCreated = await updateOpenAIAssistant(currentAssistantId, updatedIcpData, updatedIcpData.id)
    if (assistantUpdatedOrCreated) {
      toast({ title: "AI Assistant Updated", description: `AI assistant for "${updatedIcpData.name}" updated.` })
    } else {
      toast({
        title: "AI Assistant Update Failed",
        description: `Could not update AI assistant for "${updatedIcpData.name}". The ICP data is saved locally.`,
        variant: "destructive",
      })
    }
  } else {
    // Attempt to create assistant if it doesn't exist
    const newAssistantId = await createOpenAIAssistant(updatedIcpData, updatedIcpData.id)
    if (newAssistantId) {
      currentAssistantId = newAssistantId
      updatedIcpData.assistantId = newAssistantId // Ensure the updated data has the new ID
      assistantUpdatedOrCreated = true
      toast({ title: "AI Assistant Created", description: `AI assistant for "${updatedIcpData.name}" created.` })
    } else {
      toast({
        title: "AI Assistant Creation Failed",
        description: `Could not create AI assistant for "${updatedIcpData.name}" during update. The ICP data is saved locally.`,
        variant: "destructive",
      })
    }
  }

  // Ensure local store is updated with the potentially new/updated assistantId
  const finalIcpData = {
    ...updatedIcpData,
    assistantId: currentAssistantId,
    dateModified: new Date().toISOString().split("T")[0],
  }
  icpsStore[index] = finalIcpData
  toast({ title: "ICP Updated", description: `ICP "${finalIcpData.name}" updated locally.` })
  return finalIcpData
}

export const deleteICP = async (id: string): Promise<boolean> => {
  const index = icpsStore.findIndex((icp) => icp.id === id)
  if (index === -1) {
    toast({ title: "Error", description: "ICP not found for deletion.", variant: "destructive" })
    return false
  }

  const icpToDelete = icpsStore[index]
  let assistantDeleted = true // Assume success if no assistant ID

  if (icpToDelete.assistantId) {
    assistantDeleted = await deleteOpenAIAssistant(icpToDelete.assistantId)
    if (assistantDeleted) {
      toast({ title: "AI Assistant Deleted", description: `AI assistant for "${icpToDelete.name}" deleted.` })
    } else {
      toast({
        title: "AI Assistant Deletion Failed",
        description: `Could not delete AI assistant for "${icpToDelete.name}". The ICP will be removed locally.`,
        variant: "destructive",
      })
    }
  }

  icpsStore.splice(index, 1)
  toast({ title: "ICP Deleted", description: `ICP "${icpToDelete.name}" deleted locally.` })
  return true // Local deletion is always successful if found
}

export const getICPById = (id: string): ICP | undefined => {
  return icpsStore.find((icp) => icp.id === id)
}
