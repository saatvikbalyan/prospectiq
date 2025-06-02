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
      const errorData = { error: `API Error: ${response.status} ${response.statusText}`, details: "" }
      try {
        // Try to parse as JSON, as our API route *should* return JSON errors
        const jsonError = await response.json()
        errorData.error = jsonError.error || errorData.error
        errorData.details = jsonError.details || (await response.text()) // Fallback to text if details not in JSON
      } catch (e) {
        // If response is not JSON (e.g., HTML error page from proxy or server crash)
        errorData.details = await response.text() // Get raw text of the error
        console.error("Response was not valid JSON. Raw response:", errorData.details)
      }
      console.error("API Error creating OpenAI assistant:", response.status, errorData)
      throw new Error(errorData.error) // Throw the primary error message
    }

    const data = await response.json() // Should be safe now if response.ok
    console.log("OpenAI Assistant created successfully via API:", data.assistantId)
    return data.assistantId
  } catch (error) {
    // This catch block now handles errors from the fetch call itself (network issues)
    // or errors thrown from the !response.ok block above.
    console.error("Fetch Error or API processing error creating OpenAI assistant:", error)
    // Ensure the error propagated to toast in icp-service is useful
    if (error instanceof Error) {
      // Potentially re-throw or handle to ensure icp-service shows a good toast
      // For now, icp-service's generic OpenAI error toast will catch this.
    }
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
      const errorData = { error: `API Error: ${response.status} ${response.statusText}`, details: "" }
      try {
        const jsonError = await response.json()
        errorData.error = jsonError.error || errorData.error
        errorData.details = jsonError.details || (await response.text())
      } catch (e) {
        errorData.details = await response.text()
        console.error("Response was not valid JSON. Raw response:", errorData.details)
      }
      console.error("API Error updating OpenAI assistant:", response.status, errorData)
      throw new Error(errorData.error)
    }

    const data = await response.json()
    console.log("OpenAI Assistant updated successfully via API:", data.assistantId)
    return data.assistantId
  } catch (error) {
    console.error("Fetch Error or API processing error updating OpenAI assistant:", error)
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
      const errorData = { error: `API Error: ${response.status} ${response.statusText}`, details: "" }
      try {
        const jsonError = await response.json()
        errorData.error = jsonError.error || errorData.error
        errorData.details = jsonError.details || (await response.text())
      } catch (e) {
        errorData.details = await response.text()
        console.error("Response was not valid JSON. Raw response:", errorData.details)
      }
      console.error("API Error deleting OpenAI assistant:", response.status, errorData)
      throw new Error(errorData.error)
    }
    const data = await response.json()
    console.log("OpenAI Assistant deleted successfully via API:", data.message)
    return data.success
  } catch (error) {
    console.error("Fetch Error or API processing error deleting OpenAI assistant:", error)
    return false
  }
}
