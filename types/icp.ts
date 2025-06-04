export type ParameterOutputScoringType = "String" | "Number" | "Score Range" | "Binary"

export interface CustomParameter {
  id: string
  parameterName: string
  parameterDescription: string
  scoringType: ParameterOutputScoringType
  scoringMin?: number // Optional, only for 'Score Range'
  scoringMax?: number // Optional, only for 'Score Range'
}

export interface ICP {
  id: string // Application-generated ID
  name: string
  description: string
  customParameters: CustomParameter[]
  dateModified?: string // Will be handled by DB, but good for client-side
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "default"
  assistantId?: string | null // OpenAI Assistant ID (backend only)
  systemPrompt?: string | null // Generated system prompt (backend only)
  userId?: string // To associate with a user
  createdAt?: string // Will be handled by DB
  updatedAt?: string // Will be handled by DB
}
