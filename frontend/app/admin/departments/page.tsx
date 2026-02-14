"use client"
import { useEffect, useState } from "react"

type Departments = {
  department_id: number
  name: string
  total_classes: number
  total_teachers: number
  total_students: number
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Departments[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments/`, { credentials: 'include' })
        const data = await res.json()
        setDepartments(data.departments || [])
      } catch (error) {
        console.error("Failed to fetch departments:", error)
        setDepartments([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchDepartments()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Departments</h1>
        <p className="text-sm text-muted-foreground mt-1">{departments.length} departments</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 skeleton rounded-xl" />)}
        </div>
      ) : departments.length > 0 ? (
        /* Card grid for departments — works great on all screen sizes */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div
              key={d.department_id}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {d.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">ID: {d.department_id}</p>
                </div>
                <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                  🏛️
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{d.total_classes}</p>
                  <p className="text-[11px] text-muted-foreground">Classes</p>
                </div>
                <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{d.total_teachers}</p>
                  <p className="text-[11px] text-muted-foreground">Teachers</p>
                </div>
                <div className="text-center p-2.5 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{d.total_students}</p>
                  <p className="text-[11px] text-muted-foreground">Students</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground text-sm">No departments found</p>
        </div>
      )}
    </div>
  )
}