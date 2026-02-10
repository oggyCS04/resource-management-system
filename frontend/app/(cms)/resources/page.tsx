"use client"
import { useEffect, useState } from "react"

type Resource = {
  resource_id: number
  title: string
  type: string
  uploaded_by: string
  date_uploaded: string
  target_count: number
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState("All Types")
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchResources = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/resources`)
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/resources/${resourceId}`, {
          method: "DELETE"
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
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const resourceTypes = ["All Types", ...new Set(resources.map(r => r.type))]

  if (isLoading || !mounted) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Resources</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          + Add Resource
        </button>
      </div>

      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {resourceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All Uploaders</option>
            {[...new Set(resources.map(r => r.uploaded_by))].map(uploader => (
              <option key={uploader} value={uploader}>{uploader}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
        />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-indigo-600">
            <tr>
              <th className="p-4 text-left w-1/6">Resource ID</th>
              <th className="p-4 text-left w-1/4">Title</th>
              <th className="p-4 text-left w-1/6">Type</th>
              <th className="p-4 text-left w-1/6">Uploaded By</th>
              <th className="p-4 text-left w-1/6">Date Uploaded</th>

            </tr>
          </thead>
          <tbody>
            {filteredResources.length > 0 ? (
              filteredResources.map((r) => (
                <tr key={r.resource_id} className="border-t hover:bg-gray-50">
                  <td className="p-4 w-1/6">{r.resource_id}</td>
                  <td className="p-4 w-1/4">{r.title}</td>
                  <td className="p-4 w-1/6">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                      {r.type}
                    </span>
                  </td>
                  <td className="p-4 w-1/6">{r.uploaded_by}</td>
                  <td className="p-4 w-1/6">{r.date_uploaded}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No resources found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}