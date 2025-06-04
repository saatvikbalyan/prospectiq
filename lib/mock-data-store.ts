import type { ICP } from "@/types/icp"
import { generateICPSystemPrompt } from "./prompt-generator"

// Demo user ID for all operations
export const DEMO_USER_ID = "demo-user-123"

// Initial demo data
const initialICPs: ICP[] = [
  {
    id: "icp_1",
    name: "Enterprise SaaS Buyers",
    description: "Decision makers at large enterprises looking for software solutions",
    customParameters: [
      {
        id: "param_1",
        parameterName: "Company Size",
        parameterDescription: "Number of employees in the organization",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 100,
      },
      {
        id: "param_2",
        parameterName: "Annual Budget",
        parameterDescription: "Available budget for software solutions",
        scoringType: "Number",
      },
      {
        id: "param_3",
        parameterName: "Industry Focus",
        parameterDescription: "Primary industry vertical",
        scoringType: "String",
      },
    ],
    color: "blue",
    assistantId: "asst_demo1",
    systemPrompt: "You are an assistant specialized in enterprise SaaS solutions...",
    userId: DEMO_USER_ID,
    createdAt: "2023-10-15T08:30:00Z",
    updatedAt: "2023-11-20T14:45:00Z",
    dateModified: "2023-11-20",
  },
  {
    id: "icp_2",
    name: "SMB Marketing Teams",
    description: "Marketing professionals at small to medium businesses",
    customParameters: [
      {
        id: "param_4",
        parameterName: "Team Size",
        parameterDescription: "Number of marketing team members",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 50,
      },
      {
        id: "param_5",
        parameterName: "Marketing Budget",
        parameterDescription: "Monthly marketing spend",
        scoringType: "Number",
      },
      {
        id: "param_6",
        parameterName: "Has Marketing Automation",
        parameterDescription: "Whether the company uses marketing automation tools",
        scoringType: "Binary",
      },
    ],
    color: "green",
    assistantId: "asst_demo2",
    systemPrompt: "You are an assistant specialized in SMB marketing solutions...",
    userId: DEMO_USER_ID,
    createdAt: "2023-09-05T10:15:00Z",
    updatedAt: "2023-12-01T09:20:00Z",
    dateModified: "2023-12-01",
  },
  {
    id: "icp_3",
    name: "E-commerce Retailers",
    description: "Online retailers looking to optimize their sales channels",
    customParameters: [
      {
        id: "param_7",
        parameterName: "Annual Revenue",
        parameterDescription: "Yearly revenue from online sales",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 100,
      },
      {
        id: "param_8",
        parameterName: "Platform Type",
        parameterDescription: "E-commerce platform being used",
        scoringType: "String",
      },
      {
        id: "param_9",
        parameterName: "Uses Analytics",
        parameterDescription: "Whether the company uses advanced analytics",
        scoringType: "Binary",
      },
    ],
    color: "purple",
    assistantId: "asst_demo3",
    systemPrompt: "You are an assistant specialized in e-commerce optimization...",
    userId: DEMO_USER_ID,
    createdAt: "2023-08-20T15:45:00Z",
    updatedAt: "2023-12-10T11:30:00Z",
    dateModified: "2023-12-10",
  },
]

// In-memory store for ICPs
let icpStore: ICP[] = [...initialICPs]

// Helper to create a deep copy of the store to prevent unintended mutations
const getStore = () => JSON.parse(JSON.stringify(icpStore)) as ICP[]

// CRUD operations for ICPs
export const mockDataStore = {
  // Get all ICPs
  getICPs: async (): Promise<ICP[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return getStore()
  },

  // Get ICP by ID
  getICPById: async (id: string): Promise<ICP | null> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    const icp = getStore().find((icp) => icp.id === id)
    return icp || null
  },

  // Add new ICP
  addICP: async (
    icpData: Omit<ICP, "id" | "assistantId" | "systemPrompt" | "createdAt" | "updatedAt" | "dateModified" | "userId">,
  ): Promise<ICP> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const now = new Date().toISOString()
    const newId = `icp_${Date.now()}`

    const systemPrompt = generateICPSystemPrompt({
      ...icpData,
      id: newId,
      customParameters: icpData.customParameters || [],
      userId: DEMO_USER_ID,
    })

    const newICP: ICP = {
      id: newId,
      name: icpData.name,
      description: icpData.description,
      customParameters: icpData.customParameters || [],
      color: icpData.color || "blue",
      assistantId: `asst_${newId}`,
      systemPrompt: systemPrompt,
      userId: DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
      dateModified: now.split("T")[0], // Just the date part
    }

    icpStore = [...icpStore, newICP]
    return newICP
  },

  // Update existing ICP
  updateICP: async (
    icpId: string,
    updates: Partial<Omit<ICP, "id" | "createdAt" | "updatedAt">>,
  ): Promise<ICP | null> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const icpIndex = icpStore.findIndex((icp) => icp.id === icpId)
    if (icpIndex === -1) return null

    const currentICP = icpStore[icpIndex]
    const now = new Date().toISOString()

    // Generate new system prompt if needed
    let systemPrompt = currentICP.systemPrompt
    if (updates.name || updates.description || updates.customParameters) {
      const updatedICPForPrompt: ICP = {
        ...currentICP,
        name: updates.name || currentICP.name,
        description: updates.description || currentICP.description,
        customParameters: updates.customParameters || currentICP.customParameters,
      }
      systemPrompt = generateICPSystemPrompt(updatedICPForPrompt)
    }

    const updatedICP: ICP = {
      ...currentICP,
      ...updates,
      systemPrompt,
      updatedAt: now,
      dateModified: now.split("T")[0], // Just the date part
    }

    icpStore[icpIndex] = updatedICP
    return updatedICP
  },

  // Delete ICP
  deleteICP: async (icpId: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const initialLength = icpStore.length
    icpStore = icpStore.filter((icp) => icp.id !== icpId)

    return icpStore.length < initialLength
  },

  // Reset store to initial data (useful for testing)
  resetStore: () => {
    icpStore = [...initialICPs]
  },
}
