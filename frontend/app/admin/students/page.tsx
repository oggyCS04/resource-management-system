"use client"
import { useEffect, useState } from "react"
import { authenticatedFetch } from "@/lib/api-client"

type Student = {
  user_id: number
  campus_rollno: string
  full_name: string
  email: string
  class: string
  year: number
  part: number
  is_active: boolean
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/users/students`)
        const data = await res.json()
        setStudents(data.students || [])
      } catch (err) {
        console.error("Failed to fetch students:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.campus_rollno.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">{students.length} total students</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search students..."
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
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roll No.</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Part</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s) => (
                    <tr key={s.user_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-mono text-foreground">{s.campus_rollno}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">{s.full_name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.email}</td>
                      <td className="px-5 py-3.5 text-sm text-center text-foreground">{s.class}</td>
                      <td className="px-5 py-3.5 text-sm text-center text-foreground">{s.year}</td>
                      <td className="px-5 py-3.5 text-sm text-center text-foreground">{s.part}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.is_active
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                          {s.is_active ? "Active" : "Inactive"}
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
            {filtered.map((s) => (
              <div key={s.user_id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.campus_rollno}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{s.email}</p>
                <div className="flex gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Class: <strong className="text-foreground">{s.class}</strong></span>
                  <span>Year: <strong className="text-foreground">{s.year}</strong></span>
                  <span>Part: <strong className="text-foreground">{s.part}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No students found</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
