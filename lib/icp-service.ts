import { getSupabaseBrowserClient } from "./supabase-client"
import type { ICP } from "@/types/icp"
import { generateICPSystemPrompt } from "./prompt-generator"
import { toast } from "@/hooks/use-toast"

const supabase = getSupabaseBrowserClient()

export async function getICPsFromSupabase(): Promise<ICP[]> {
  const { data, error } = await supabase.from("icps").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching ICPs from Supabase:", error)
    toast({ title: "Database Error", description: "Could not fetch ICPs. " + error.message, variant: "destructive" })
    return []
  }
  return data.map(mapRowToICP) || []
}

export async function getICPByIdFromSupabase(id: string): Promise<ICP | null> {
  const { data, error } = await supabase.from("icps").select("*").eq("id", id).single()

  if (error) {
    if (error.code === "PGRST116") {
      console.info(`ICP with id ${id} not found or not accessible (PGRST116). Details:`, JSON.stringify(error, null, 2))
    } else {
      console.error(`Supabase error fetching ICP with id ${id}:`, JSON.stringify(error, null, 2))
    }

    if (error.code !== "PGRST116") {
      toast({
        title: "Database Error",
        description: `Could not fetch ICP (ID: ${id}). ${error.message}`,
        variant: "destructive",
      })
    }
    return null
  }
  return data ? mapRowToICP(data) : null
}

export async function addICPToSupabase(
  icpData: Omit<ICP, "id" | "assistantId" | "systemPrompt" | "createdAt" | "updatedAt" | "dateModified" | "userId">,
  userId: string, // Added userId as a parameter
): Promise<ICP | null> {
  const newId = `icp_${Date.now().toString()}`

  const systemPrompt = generateICPSystemPrompt({
    ...icpData,
    id: newId,
    customParameters: icpData.customParameters || [],
    userId: userId, // Include userId for prompt generation if needed
  })

  console.log("OpenAI Assistant creation is bypassed. Storing ICP data directly.")

  if (!userId) {
    // This check is now more of a safeguard, as userId is passed in.
    console.error("User ID not provided to addICPToSupabase. Cannot add ICP.")
    toast({
      title: "Authentication Error",
      description: "User ID is missing. Cannot create an ICP.",
      variant: "destructive",
    })
    return null
  }

  const icpToInsert = {
    ...icpData,
    id: newId,
    custom_parameters: icpData.customParameters as any,
    system_prompt: systemPrompt,
    assistant_id: null,
    user_id: userId,
  }

  // @ts-ignore
  const { data, error } = await supabase.from("icps").insert(icpToInsert).select().single()

  if (error) {
    console.error("Error adding ICP to Supabase:", JSON.stringify(error, null, 2))
    toast({ title: "Database Error", description: "Could not add ICP. " + error.message, variant: "destructive" })
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
    toast({
      title: "Update Failed",
      description: `ICP with ID ${icpId} not found or inaccessible. Cannot update.`,
      variant: "destructive",
    })
    return null
  }

  let systemPrompt = currentICP.systemPrompt

  const needsPromptUpdate = icpUpdates.name || icpUpdates.description || icpUpdates.customParameters

  if (needsPromptUpdate) {
    const updatedFullICPDataForPrompt: ICP = {
      id: icpId,
      name: icpUpdates.name || currentICP.name,
      description: icpUpdates.description || currentICP.description,
      customParameters: icpUpdates.customParameters || currentICP.customParameters || [],
      color: icpUpdates.color || currentICP.color,
      assistantId: currentICP.assistantId,
      systemPrompt: currentICP.systemPrompt,
      userId: currentICP.userId, // Use existing userId from currentICP
      createdAt: currentICP.createdAt,
      updatedAt: currentICP.updatedAt,
      dateModified: currentICP.dateModified,
    }
    systemPrompt = generateICPSystemPrompt(updatedFullICPDataForPrompt)
    console.log("System prompt regenerated due to ICP data changes. OpenAI assistant interaction is bypassed.")
  }

  const updatesForSupabase = {
    ...icpUpdates,
    custom_parameters: icpUpdates.customParameters
      ? (icpUpdates.customParameters as any)
      : (currentICP.customParameters as any),
    system_prompt: systemPrompt,
    assistant_id: icpUpdates.assistantId !== undefined ? icpUpdates.assistantId : currentICP.assistantId,
    date_modified: new Date().toISOString(),
  }

  Object.keys(updatesForSupabase).forEach(
    (key) => (updatesForSupabase as any)[key] === undefined && delete (updatesForSupabase as any)[key],
  )

  // @ts-ignore
  const { data, error } = await supabase.from("icps").update(updatesForSupabase).eq("id", icpId).select().single()

  if (error) {
    console.error(`Error updating ICP (ID: ${icpId}) in Supabase:`, JSON.stringify(error, null, 2))
    toast({ title: "Database Error", description: "Could not update ICP. " + error.message, variant: "destructive" })
    return null
  }

  toast({ title: "Success", description: "ICP updated successfully!" })
  return data ? mapRowToICP(data) : null
}

export async function deleteICPFromSupabase(icpId: string): Promise<boolean> {
  console.log("OpenAI Assistant deletion is bypassed for ICP:", icpId)

  const { error } = await supabase.from("icps").delete().eq("id", icpId)

  if (error) {
    console.error(`Error deleting ICP (ID: ${icpId}) from Supabase:`, JSON.stringify(error, null, 2))
    toast({ title: "Database Error", description: "Could not delete ICP. " + error.message, variant: "destructive" })
    return false
  }

  toast({ title: "Success", description: "ICP deleted successfully." })
  return true
}

function mapRowToICP(row: any): ICP {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    customParameters:
      (typeof row.custom_parameters === "string" ? JSON.parse(row.custom_parameters) : row.custom_parameters) || [],
    dateModified: row.date_modified || row.updated_at,
    color: row.color,
    assistantId: row.assistant_id,
    systemPrompt: row.system_prompt,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as ICP
}
