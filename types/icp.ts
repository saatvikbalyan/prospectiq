export type ParameterOutputScoringType = "String" | "Number" | "Score Range"

export interface CustomParameter {
  id: string
  parameterName: string
  parameterDescription: string
  scoringType: ParameterOutputScoringType
  scoringMin?: number // Optional, only for 'Score Range'
  scoringMax?: number // Optional, only for 'Score Range'
}

export interface ICP {
  id: string
  name: string
  description: string
  dateModified: string
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "default"
  customParameters: CustomParameter[]
  assistantId?: string // New field for OpenAI Assistant ID
}
