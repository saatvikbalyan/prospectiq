import type { ICP } from "@/types/icp"

// This would typically be replaced with a proper state management solution
// or API calls in a real application
let icpsStore: ICP[] = []

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
