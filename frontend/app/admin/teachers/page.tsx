"use client"
import { useEffect, useState } from "react"

type Teacher = {
  teacher_id: number
  full_name: string
  email: string
  department_id: number
  is_active: boolean
}

const DEPARTMENTS: Record<number, string> = {
  1: "Electronics & Computer",
  2: "Architecture",
  3: "Applied Science",
  4: "Automobile & Mechanical",
  5: "Civil Engineering",
  6: "Industrial Engineering",
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/teachers`)
        const data = await res.json()
        setTeachers(data.teachers || [])
      } catch (err) {
        console.error("Failed to fetch teachers:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  const filtered = teachers.filter(t =>
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Teachers</h1>
          <p className="text-sm text-muted-foreground mt-1">{teachers.length} total teachers</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search teachers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-sm h-10 pl-10 pr-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
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
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((t) => (
                    <tr key={t.teacher_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">{t.teacher_id}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">{t.full_name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{t.email}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{DEPARTMENTS[t.department_id] || "Unknown"}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${t.is_active
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                          {t.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((t) => (
              <div key={t.teacher_id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{t.full_name}</p>
                    <p className="text-sm text-muted-foreground">{t.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${t.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                    {t.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">Dept: <strong className="text-foreground">{DEPARTMENTS[t.department_id] || "Unknown"}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No teachers found</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
