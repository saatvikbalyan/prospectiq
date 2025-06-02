// This file now makes fetch calls to our API routes

export async function createOpenAIAssistant(icpName: string, systemPrompt: string): Promise<string | null> {
  console.log("Attempting to create OpenAI assistant via API for:", icpName)
  try {
    const response = await fetch("/api/openai/create-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icpName, systemPrompt }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API Error creating OpenAI assistant:", response.status, errorData)
      throw new Error(errorData.error || `Failed to create assistant: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("OpenAI Assistant created successfully via API:", data.assistantId)
    return data.assistantId
  } catch (error) {
    console.error("Fetch Error creating OpenAI assistant:", error)
    return null
  }
}

export async function updateOpenAIAssistant(
  assistantId: string,
  icpName: string,
  systemPrompt: string,
): Promise<string | null> {
  console.log("Attempting to update OpenAI assistant via API:", assistantId)
  try {
    const response = await fetch("/api/openai/update-assistant", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistantId, icpName, systemPrompt }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API Error updating OpenAI assistant:", response.status, errorData)
      throw new Error(errorData.error || `Failed to update assistant: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("OpenAI Assistant updated successfully via API:", data.assistantId)
    return data.assistantId
  } catch (error) {
    console.error("Fetch Error updating OpenAI assistant:", error)
    return null
  }
}

export async function deleteOpenAIAssistant(assistantId: string): Promise<boolean> {
  console.log("Attempting to delete OpenAI assistant via API:", assistantId)
  try {
    const response = await fetch("/api/openai/delete-assistant", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistantId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("API Error deleting OpenAI assistant:", response.status, errorData)
      throw new Error(errorData.error || `Failed to delete assistant: ${response.statusText}`)
    }
    const data = await response.json()
    console.log("OpenAI Assistant deleted successfully via API:", data.message)
    return data.success
  } catch (error) {
    console.error("Fetch Error deleting OpenAI assistant:", error)
    return false
  }
}
