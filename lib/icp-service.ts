import { getSupabaseBrowserClient } from "./supabase-client"
import type { ICP } from "@/types/icp"
import { generateICPSystemPrompt } from "./prompt-generator"
import { createOpenAIAssistant, updateOpenAIAssistant, deleteOpenAIAssistant } from "./openai-assistant-manager"
import { toast } from "@/hooks/use-toast" // Assuming you have a toast hook

const supabase = getSupabaseBrowserClient()

export async function getICPsFromSupabase(): Promise<ICP[]> {
  const { data, error } = await supabase.from("icps").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching ICPs:", error)
    toast({ title: "Error", description: "Could not fetch ICPs. " + error.message, variant: "destructive" })
    return []
  }
  // Map Supabase row to ICP type
  return data.map(mapRowToICP) || []
}

export async function getICPByIdFromSupabase(id: string): Promise<ICP | null> {
  const { data, error } = await supabase.from("icps").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching ICP with id ${id}:`, error)
    if (error.code !== "PGRST116") {
      // PGRST116: "Searched for a single row, but found no rows" - this is fine for a "not found" case
      toast({ title: "Error", description: `Could not fetch ICP. ${error.message}`, variant: "destructive" })
    }
    return null
  }
  return data ? mapRowToICP(data) : null
}

export async function addICPToSupabase(
  icpData: Omit<ICP, "id" | "assistantId" | "systemPrompt" | "createdAt" | "updatedAt" | "dateModified">,
): Promise<ICP | null> {
  const newId = `icp_${Date.now().toString()}` // Simple unique ID generation

  const systemPrompt = generateICPSystemPrompt({
    ...icpData,
    id: newId,
    customParameters: icpData.customParameters || [],
  })

  let assistantId: string | null = null
  if (process.env.NEXT_PUBLIC_ENABLE_OPENAI_ASSISTANTS === "true") {
    // Control assistant creation via env var
    assistantId = await createOpenAIAssistant(icpData.name, systemPrompt)
    if (!assistantId) {
      toast({
        title: "OpenAI Error",
        description: "Failed to create OpenAI assistant. ICP saved without assistant.",
        variant: "warning",
      })
      // Proceed to save ICP without assistantId if creation fails
    }
  } else {
    console.log("OpenAI Assistant creation is disabled via environment variable.")
  }

  const icpToInsert = {
    ...icpData,
    id: newId,
    custom_parameters: icpData.customParameters as any, // Supabase expects JSON
    system_prompt: systemPrompt,
    assistant_id: assistantId,
    // user_id will be set by RLS policy default or explicitly if needed
  }

  // @ts-ignore - Supabase types might not perfectly align with our ICP type for insert
  const { data, error } = await supabase.from("icps").insert(icpToInsert).select().single()

  if (error) {
    console.error("Error adding ICP:", error)
    toast({ title: "Database Error", description: "Could not add ICP. " + error.message, variant: "destructive" })
    // If assistant was created but DB save failed, consider deleting the orphaned assistant
    if (assistantId) {
      console.warn(`Orphaned OpenAI assistant ${assistantId} may have been created. Attempting to delete.`)
      await deleteOpenAIAssistant(assistantId)
    }
    return null
  }

  toast({ title: "Success", description: "ICP created successfully!" })
  return data ? mapRowToICP(data) : null
}

export async function updateICPInSupabase(
  icpId: string,
  icpUpdates: Partial<Omit<ICP, "id" | "createdAt" | "updatedAt">>,
): Promise<ICP | null> {
  const currentICP = await getICPByIdFromSupabase(icpId)
  if (!currentICP) {
    toast({ title: "Error", description: "ICP not found for update.", variant: "destructive" })
    return null
  }

  let systemPrompt = currentICP.systemPrompt
  let assistantId = currentICP.assistantId

  // Check if name or customParameters changed, requiring prompt/assistant update
  const needsPromptUpdate = icpUpdates.name || icpUpdates.customParameters

  if (needsPromptUpdate) {
    const updatedFullICP: ICP = {
      ...currentICP,
      ...icpUpdates,
      // Ensure customParameters is an array for prompt generation
      customParameters: icpUpdates.customParameters || currentICP.customParameters || [],
    }
    systemPrompt = generateICPSystemPrompt(updatedFullICP)

    if (process.env.NEXT_PUBLIC_ENABLE_OPENAI_ASSISTANTS === "true") {
      if (assistantId) {
        const updatedAssistantId = await updateOpenAIAssistant(assistantId, updatedFullICP.name, systemPrompt)
        if (!updatedAssistantId) {
          toast({
            title: "OpenAI Error",
            description: "Failed to update OpenAI assistant. ICP updated, but assistant may be out of sync.",
            variant: "warning",
          })
        }
      } else {
        // If no assistant existed, try to create one
        assistantId = await createOpenAIAssistant(updatedFullICP.name, systemPrompt)
        if (!assistantId) {
          toast({
            title: "OpenAI Error",
            description: "Failed to create OpenAI assistant during update. ICP updated without assistant.",
            variant: "warning",
          })
        }
      }
    } else {
      console.log("OpenAI Assistant update/creation is disabled via environment variable.")
    }
  }

  const updatesForSupabase = {
    ...icpUpdates,
    custom_parameters: icpUpdates.customParameters
      ? (icpUpdates.customParameters as any)
      : (currentICP.customParameters as any),
    system_prompt: systemPrompt,
    assistant_id: assistantId,
    date_modified: new Date().toISOString(), // Manually set for Supabase if not using DB trigger for this field
  }

  // @ts-ignore
  const { data, error } = await supabase.from("icps").update(updatesForSupabase).eq("id", icpId).select().single()

  if (error) {
    console.error("Error updating ICP:", error)
    toast({ title: "Database Error", description: "Could not update ICP. " + error.message, variant: "destructive" })
    return null
  }

  toast({ title: "Success", description: "ICP updated successfully!" })
  return data ? mapRowToICP(data) : null
}

export async function deleteICPFromSupabase(icpId: string): Promise<boolean> {
  const icpToDelete = await getICPByIdFromSupabase(icpId)

  if (icpToDelete && icpToDelete.assistantId && process.env.NEXT_PUBLIC_ENABLE_OPENAI_ASSISTANTS === "true") {
    const assistantDeleted = await deleteOpenAIAssistant(icpToDelete.assistantId)
    if (!assistantDeleted) {
      toast({
        title: "OpenAI Error",
        description:
          "Failed to delete associated OpenAI assistant. Please check OpenAI dashboard. ICP deletion will proceed.",
        variant: "warning",
      })
      // Decide if you want to stop ICP deletion if assistant deletion fails. For now, we proceed.
    }
  } else if (icpToDelete && icpToDelete.assistantId) {
    console.log("OpenAI Assistant deletion is disabled or no assistant ID found for ICP:", icpId)
  }

  const { error } = await supabase.from("icps").delete().eq("id", icpId)

  if (error) {
    console.error("Error deleting ICP:", error)
    toast({ title: "Database Error", description: "Could not delete ICP. " + error.message, variant: "destructive" })
    return false
  }

  toast({ title: "Success", description: "ICP deleted successfully." })
  return true
}

// Helper to map Supabase row to our ICP type
// Handles potential discrepancies between DB schema and TS type, especially for JSONB
function mapRowToICP(row: any): ICP {
  return {
    ...row,
    customParameters:
      (typeof row.custom_parameters === "string" ? JSON.parse(row.custom_parameters) : row.custom_parameters) || [],
    dateModified: row.date_modified || row.updated_at, // Prefer date_modified if it exists
  } as ICP
}
