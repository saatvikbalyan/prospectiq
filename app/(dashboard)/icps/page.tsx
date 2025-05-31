"use client"

import { useState, useEffect } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Calendar, Settings2, ListChecks, CheckCircle, X } from "lucide-react"
import { ICPModal } from "@/components/icp-modal"
import type { ICP } from "@/types/icp"
import { getICPs, addICP, updateICP, deleteICP } from "@/lib/icp-store"

const colorClasses = {
  blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  green: "from-green-500/20 to-green-600/20 border-green-500/30",
  purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
  pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
  default: "from-gray-500/20 to-gray-600/20 border-gray-500/30",
}

export default function ICPsPage() {
  const [icps, setIcps] = useState<ICP[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingICP, setEditingICP] = useState<ICP | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load ICPs from store on component mount
  useEffect(() => {
    setIcps(getICPs())
  }, [])

  const handleNewICP = () => {
    setEditingICP(null)
    setIsModalOpen(true)
  }

  const handleEditICP = (icp: ICP) => {
    setEditingICP(icp)
    setIsModalOpen(true)
  }

  const handleDeleteICP = (id: string) => {
    deleteICP(id)
    setIcps(getICPs())
    setDeletingId(null)
  }

  const handleSaveICP = (savedIcp: ICP) => {
    if (editingICP) {
      updateICP(savedIcp)
    } else {
      const newIcp = {
        ...savedIcp,
        id: Date.now().toString(),
        dateModified: new Date().toISOString().split("T")[0],
      }
      addICP(newIcp)
    }
    setIcps(getICPs())
    setIsModalOpen(false)
  }

  return (
    <SidebarInset className="gradient-bg">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6 backdrop-blur-sm bg-white/5">
        <SidebarTrigger className="-ml-1 text-white hover:bg-white/10" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold text-white">My ICPs</h1>
        </div>
        <div className="ml-auto">
          <Button onClick={handleNewICP} className="primary-button">
            <Plus className="h-4 w-4 mr-2" />
            New ICP
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {icps.map((icp) => (
            <Card
              key={icp.id}
              className="card-gradient border-white/10 hover:bg-white/10 transition-all duration-300 group relative flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle color accent bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${colorClasses[icp.color || "default"]}`}
              />

              <div className="p-5 pl-8 flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <CardTitle className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-200">
                    {icp.name}
                  </CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {deletingId === icp.id ? (
                      <div className="flex items-center gap-2 bg-gray-800/90 px-2 py-1 rounded-md border border-white/20">
                        <span className="text-xs text-white">Delete?</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20"
                          onClick={() => handleDeleteICP(icp.id)}
                          aria-label="Confirm delete"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
                          onClick={() => setDeletingId(null)}
                          aria-label="Cancel delete"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-400/70 hover:text-red-400 hover:bg-red-500/20"
                        onClick={() => setDeletingId(icp.id)}
                        aria-label={`Delete ${icp.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-blue-300/80">
                    <Calendar className="h-3.5 w-3.5 mr-2 opacity-70" />
                    Last Updated: {icp.dateModified}
                  </div>
                  <div className="flex items-center text-xs text-blue-300/80">
                    <ListChecks className="h-3.5 w-3.5 mr-2 opacity-70" />
                    Parameters: {icp.customParameters.length} defined
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 pl-8">
                <Button
                  variant="outline"
                  className="w-full secondary-button group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-200 text-sm py-2.5"
                  onClick={() => handleEditICP(icp)}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure ICP
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {icps.length === 0 && (
          <div className="text-center col-span-full py-16 glass-effect rounded-2xl border border-white/10">
            <ListChecks className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No ICPs Created Yet</h3>
            <p className="text-blue-200 mb-6">Click "New ICP" to define your first Ideal Customer Profile.</p>
            <Button onClick={handleNewICP} className="primary-button">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First ICP
            </Button>
          </div>
        )}

        {/* Floating Action Button for mobile */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl md:hidden primary-button"
          onClick={handleNewICP}
          aria-label="Create New ICP"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <ICPModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} icp={editingICP} onSave={handleSaveICP} />
    </SidebarInset>
  )
}
