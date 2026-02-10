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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/departments`)
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

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Departments</h1>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-indigo-600">
            <tr>
              <th className="p-4 text-left w-1/5">Department ID</th>
              <th className="p-4 text-left w-1/5">Name</th>
              <th className="p-4 text-center w-1/5">Total Classes</th>
              <th className="p-4 text-center w-1/5">Total Teachers</th>
              <th className="p-4 text-center w-1/5">Total Students</th>
            </tr>
          </thead>
          <tbody>
            {departments.length > 0 ? (
              departments.map((d) => (
                <tr key={d.department_id} className="border-t hover:bg-gray-50">
                  <td className="p-4 w-1/5">{d.department_id}</td>
                  <td className="p-4 w-1/5">{d.name}</td>
                  <td className="p-4 text-center w-1/5">{d.total_classes}</td>
                  <td className="p-4 text-center w-1/5">{d.total_teachers}</td>
                  <td className="p-4 text-center w-1/5">{d.total_students}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}