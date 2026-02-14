"use client"
import { useEffect, useState } from "react"

type Resource = {
  resource_id: number
  file_id: number
  description: string
  type: string
  uploaded_at: string
  uploaded_by: string
  date_uploaded: string
  target_count: number
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState("All Types")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/`, { credentials: 'include' })
        const data = await res.json()
        setResources(data.resources || [])
      } catch (error) {
        console.error("Failed to fetch resources:", error)
        setResources([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchResources()
  }, [])

  const handleDelete = async (resourceId: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/${resourceId}`, {
          method: "DELETE",
          credentials: 'include'
        })
        if (res.ok) {
          setResources(resources.filter(r => r.resource_id !== resourceId))
        } else {
          alert("Failed to delete resource")
        }
      } catch (error) {
        console.error("Delete error:", error)
        alert("Error deleting resource")
      }
    }
  }

  const filteredResources = resources.filter(r => {
    const matchesType = filterType === "All Types" || r.type === filterType
    const matchesSearch = r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const resourceTypes = ["All Types", ...new Set(resources.map(r => r.type))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Resources</h1>
          <p className="text-sm text-muted-foreground mt-1">{resources.length} total resources</p>
        </div>
        {/* <button className="inline-flex items-center justify-center h-10 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M12 5v14M5 12h14" /></svg>
          Add Resource
        </button> */}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 px-4 border border-input rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          {resourceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">File ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uploaded At</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uploaded By</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredResources.map((r) => (
                    <tr key={r.resource_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">{r.resource_id}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">{r.file_id}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">{r.description}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.uploaded_at}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.uploaded_by}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.date_uploaded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredResources.map((r) => (
              <div key={r.resource_id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-foreground">{r.description}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    {r.type}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">

                  <span>By: <strong className="text-foreground">{r.uploaded_by}</strong></span>
                  <span>{r.date_uploaded}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No resources found</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}