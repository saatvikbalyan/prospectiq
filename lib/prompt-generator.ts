import type { ICP, CustomParameter } from "@/types/icp"

function formatParameterForPrompt(param: CustomParameter): string {
  let details = `- ${param.parameterName}: ${param.parameterDescription}`
  if (param.scoringType === "Score Range") {
    details += ` (Score between ${param.scoringMin} and ${param.scoringMax})`
  } else if (param.scoringType === "Number") {
    details += ` (Expect a numerical value)`
  } else if (param.scoringType === "String") {
    details += ` (Expect a descriptive string)`
  } else if (param.scoringType === "Binary") {
    details += ` (Expect Yes/No or True/False)`
  }
  return details
}

export function generateICPSystemPrompt(icp: ICP): string {
  const coreDetails = `You are an AI assistant specialized in analyzing companies based on an Ideal Customer Profile (ICP).
Your goal is to determine how well a given company fits this ICP and provide a score and reasoning.

ICP Name: ${icp.name}
ICP Description: ${icp.description}
`

  const customParametersIntro = `
You must evaluate the company against the following custom parameters and provide a specific output for each:
`

  const customParametersDetails = icp.customParameters.map(formatParameterForPrompt).join("\n")

  const outputFormatInstructions = `
For each company analysis, you MUST provide the following outputs in a structured JSON format:
1.  "overall_score": An integer score from 1 to 100, where 100 is a perfect match for the ICP.
2.  "overall_reasoning": A concise explanation for the overall_score, highlighting key factors.
3.  "custom_parameter_outputs": An object where each key is the "parameterName" (exact match) from the custom parameters list, and the value is your assessment for that parameter according to its defined 'scoringType' and range (if applicable).

Example for a custom parameter named "Cloud Adoption Level" with type "Score Range" (1-5):
"custom_parameter_outputs": {
"Cloud Adoption Level": 3 // Or your assessed score
}

Example for a custom parameter named "Primary Industry" with type "String":
"custom_parameter_outputs": {
"Primary Industry": "Healthcare Technology" // Or your assessed string
}

Example for a custom parameter named "Uses CRM" with type "Binary":
"custom_parameter_outputs": {
"Uses CRM": true // Or false
}

Example for a custom parameter named "Employee Count" with type "Number":
"custom_parameter_outputs": {
"Employee Count": 250 // Or your assessed number
}

Focus your analysis solely on the provided ICP criteria. Be objective and thorough.
If information for a specific parameter is not readily available or cannot be reasonably inferred for the company being analyzed, explicitly state that for that parameter's output (e.g., "Information not available"). Do not invent data.
`

  return `${coreDetails}${customParametersIntro}${customParametersDetails}\n${outputFormatInstructions}`
}
