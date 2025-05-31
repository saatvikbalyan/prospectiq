import type { ICP } from "@/types/icp"

// This would typically be replaced with a proper state management solution
// or API calls in a real application
let icpsStore: ICP[] = [
  {
    id: "1",
    name: "Enterprise Tech Companies",
    description: "Large technology companies with 500+ employees, focusing on cloud infrastructure and AI solutions.",
    dateModified: "2024-05-15",
    color: "blue",
    customParameters: [
      {
        id: "cp1",
        parameterName: "Cloud Adoption Level",
        parameterDescription: "Maturity of cloud usage (e.g., Low, Medium, High).",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 5,
      },
      {
        id: "cp2",
        parameterName: "AI Integration Projects",
        parameterDescription: "Number of active AI projects.",
        scoringType: "Number",
      },
    ],
  },
  {
    id: "2",
    name: "Mid-Market SaaS",
    description: "SaaS companies with $10M-$100M revenue, typically Series B or C funded.",
    dateModified: "2024-05-14",
    color: "green",
    customParameters: [
      {
        id: "cp3",
        parameterName: "Annual Recurring Revenue (ARR)",
        parameterDescription: "Current ARR in millions.",
        scoringType: "Score Range",
        scoringMin: 10,
        scoringMax: 100,
      },
      {
        id: "cp4",
        parameterName: "Integration Ecosystem",
        parameterDescription: "Number of key integrations offered.",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 20,
      },
    ],
  },
  {
    id: "3",
    name: "Healthcare Tech Innovators",
    description: "Startups and established firms in healthcare technology, medical devices, and digital health.",
    dateModified: "2024-05-13",
    color: "purple",
    customParameters: [
      {
        id: "cp5",
        parameterName: "Regulatory Compliance",
        parameterDescription: "Adherence to HIPAA, FDA approvals, etc. (1=Low, 5=High)",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 5,
      },
      {
        id: "cp6",
        parameterName: "Clinical Trial Stage",
        parameterDescription: "If applicable, current stage of clinical trials (0=N/A, 4=Phase IV)",
        scoringType: "Score Range",
        scoringMin: 0,
        scoringMax: 4,
      },
      {
        id: "cp7",
        parameterName: "Patient Impact Score",
        parameterDescription: "Estimated impact on patient outcomes (1-10).",
        scoringType: "Score Range",
        scoringMin: 1,
        scoringMax: 10,
      },
    ],
  },
]

export const getICPs = (): ICP[] => {
  return [...icpsStore]
}

export const addICP = (icp: ICP): void => {
  icpsStore.push(icp)
}

export const updateICP = (updatedIcp: ICP): void => {
  const index = icpsStore.findIndex((icp) => icp.id === updatedIcp.id)
  if (index !== -1) {
    icpsStore[index] = updatedIcp
  }
}

export const deleteICP = (id: string): void => {
  icpsStore = icpsStore.filter((icp) => icp.id !== id)
}

export const getICPById = (id: string): ICP | undefined => {
  return icpsStore.find((icp) => icp.id === id)
}
