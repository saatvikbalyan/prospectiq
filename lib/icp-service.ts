import type { ICP } from "@/types/icp"
import { mockDataStore } from "./mock-data-store"
import { toast } from "@/hooks/use-toast"

export async function getICPsFromSupabase(): Promise<ICP[]> {
  try {
    const icps = await mockDataStore.getICPs()
    return icps
  } catch (error) {
    console.error("Error fetching ICPs:", error)
    toast({ title: "Error", description: "Could not fetch ICPs", variant: "destructive" })
    return []
  }
}

export async function getICPByIdFromSupabase(id: string): Promise<ICP | null> {
  try {
    const icp = await mockDataStore.getICPById(id)
    if (!icp) {
      console.info(`ICP with id ${id} not found`)
    }
    return icp
  } catch (error) {
    console.error(`Error fetching ICP with id ${id}:`, error)
    toast({
      title: "Error",
      description: `Could not fetch ICP (ID: ${id})`,
      variant: "destructive",
    })
    return null
  }
}

export async function addICPToSupabase(
  icpData: Omit<ICP, "id" | "assistantId" | "systemPrompt" | "createdAt" | "updatedAt" | "dateModified" | "userId">,
  userId?: string, // Made optional since we'll use DEMO_USER_ID
): Promise<ICP | null> {
  try {
    console.log("Creating new ICP with demo data")
    const savedICP = await mockDataStore.addICP(icpData)
    toast({ title: "Success", description: "ICP created successfully!" })
    return savedICP
  } catch (error) {
    console.error("Error adding ICP:", error)
    toast({ title: "Error", description: "Could not add ICP", variant: "destructive" })
    return null
  }
}

export async function updateICPInSupabase(
  icpId: string,
  icpUpdates: Partial<Omit<ICP, "id" | "createdAt" | "updatedAt">>,
): Promise<ICP | null> {
  try {
    const currentICP = await mockDataStore.getICPById(icpId)

    if (!currentICP) {
      toast({
        title: "Update Failed",
        description: `ICP with ID ${icpId} not found. Cannot update.`,
        variant: "destructive",
      })
      return null
    }

    const updatedICP = await mockDataStore.updateICP(icpId, icpUpdates)

    if (updatedICP) {
      toast({ title: "Success", description: "ICP updated successfully!" })
    }

    return updatedICP
  } catch (error) {
    console.error(`Error updating ICP (ID: ${icpId}):`, error)
    toast({ title: "Error", description: "Could not update ICP", variant: "destructive" })
    return null
  }
}

export async function deleteICPFromSupabase(icpId: string): Promise<boolean> {
  try {
    const success = await mockDataStore.deleteICP(icpId)

    if (success) {
      toast({ title: "Success", description: "ICP deleted successfully." })
    } else {
      toast({ title: "Error", description: "ICP not found or could not be deleted", variant: "destructive" })
    }

    return success
  } catch (error) {
    console.error(`Error deleting ICP (ID: ${icpId}):`, error)
    toast({ title: "Error", description: "Could not delete ICP", variant: "destructive" })
    return false
  }
}
