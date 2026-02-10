"use client"
import { useEffect, useState } from "react"

type Teacher = {
  teacher_id: number
  full_name: string
  email: string
  department_id: number
  is_active: boolean
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])

  const fetchTeachers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/teachers`)
    const data = await res.json()
    setTeachers(data.teachers)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers()
    }, 0);
    return () => clearTimeout(timer);
  }, [])


  return (

    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Teachers</h1>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-indigo-600">
            <tr>
              <th className="p-4 text-left">Student Roll No.</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-center">Department</th>  
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.teacher_id} className="border-t hover:bg-gray-50">
                <td className="p-4">{t.teacher_id}</td>
                <td className="p-4">{t.full_name}</td>
                <td className="p-4">{t.email}</td>
                <td className="p-4 text-center">{
                  t.department_id === 1 ? "Electronics and Computer Engineering" :
                  t.department_id === 2 ? "Architecture" :
                  t.department_id === 3 ? "Applied Science" :
                  t.department_id === 4 ? "Automobile and Mechanical Engineering" :
                  t.department_id === 5 ? "Civil Engineering" :
                  t.department_id === 6 ? "Industrial Engineering" : 
                  "Unknown"
                }
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${t.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {t.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
