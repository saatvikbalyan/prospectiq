import OpenAI from "openai"
import type { ICP, CustomParameter } from "@/types/icp"

// WARNING: Hardcoding API keys is insecure. Use environment variables in production.
const OPENAI_API_KEY =
  "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"

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage in Next.js
})

function generateAssistantInstructions(icp: Omit<ICP, "id" | "dateModified" | "assistantId" | "color">): string {
  const parametersInfo =
    icp.customParameters.length > 0
      ? `
Key parameters to consider for scoring:
${icp.customParameters
  .map(
    (p: CustomParameter) =>
      `- ${p.parameterName}: ${p.parameterDescription} (Output type: ${p.scoringType}${p.scoringType === "Score Range" ? `, expected range: ${p.scoringMin}-${p.scoringMax}` : ""})`,
  )
  .join("\n")}
`
      : "No custom parameters defined. Focus on the general description."

  return `You are an AI assistant specialized in evaluating companies against a specific Ideal Customer Profile (ICP). Your primary function is to determine how well a given company fits this profile and provide a detailed analysis.

ICP Name: ${icp.name}
ICP Description: ${icp.description}
${parametersInfo}

When analyzing a company, please:
1. Assess the company against each custom parameter defined above, if any.
2. Provide a score or qualitative assessment for each parameter based on its defined output type.
3. Give an overall score (1-100) indicating the company's fit with the ICP.
4. Provide a concise reasoning for the overall score, highlighting key strengths and weaknesses regarding the ICP.
5. If custom parameters have score ranges, try to stay within those ranges for individual parameter scores.
6. Your output for each company should be structured and easy to read.
`
}

export async function createOpenAIAssistant(
  icpData: Omit<ICP, "id" | "dateModified" | "assistantId" | "color">,
  icpId: string,
): Promise<string | null> {
  try {
    const assistant = await openai.beta.assistants.create({
      name: `ProspectIQ Assistant - ${icpData.name.substring(0, 40)} - ${icpId}`,
      description: `Assistant for ICP: ${icpData.name}. ${icpData.description.substring(0, 200)}...`,
      instructions: generateAssistantInstructions(icpData),
      model: "gpt-4o", // Or your preferred model
      metadata: {
        icpId: icpId,
        source: "ProspectIQApp",
      },
    })
    console.log("OpenAI Assistant created:", assistant.id)
    return assistant.id
  } catch (error) {
    console.error("Error creating OpenAI assistant:", error)
    return null
  }
}

export async function updateOpenAIAssistant(
  assistantId: string,
  icpData: Omit<ICP, "id" | "dateModified" | "assistantId" | "color">,
  icpId: string,
): Promise<boolean> {
  try {
    await openai.beta.assistants.update(assistantId, {
      name: `ProspectIQ Assistant - ${icpData.name.substring(0, 40)} - ${icpId}`,
      description: `Assistant for ICP: ${icpData.name}. ${icpData.description.substring(0, 200)}...`,
      instructions: generateAssistantInstructions(icpData),
      model: "gpt-4o",
      metadata: {
        icpId: icpId,
        source: "ProspectIQApp",
      },
    })
    console.log("OpenAI Assistant updated:", assistantId)
    return true
  } catch (error) {
    console.error("Error updating OpenAI assistant:", error)
    return false
  }
}

export async function deleteOpenAIAssistant(assistantId: string): Promise<boolean> {
  try {
    await openai.beta.assistants.del(assistantId)
    console.log("OpenAI Assistant deleted:", assistantId)
    return true
  } catch (error) {
    console.error("Error deleting OpenAI assistant:", error)
    // If assistant not found, it might have been deleted manually. Consider this a success.
    if (error instanceof OpenAI.APIError && error.status === 404) {
      console.warn("Assistant not found during deletion (already deleted?):", assistantId)
      return true
    }
    return false
  }
}
