"use client"
import { useEffect, useState } from "react"

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

  const fetchStudents = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/students`)
    const data = await res.json()
    setStudents(data.students)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents()
    }, 0);
    return () => clearTimeout(timer);
  }, [])


  return (

    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Students</h1>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-indigo-600">
            <tr>
              <th className="p-4 text-left">Student Roll No.</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-center">Class</th>
              <th className="p-4 text-center">Year</th>
              <th className="p-4 text-center">Part</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.user_id} className="border-t hover:bg-gray-50">
                <td className="p-4">{s.campus_rollno}</td>
                <td className="p-4">{s.full_name}</td>
                <td className="p-4">{s.email}</td>
                <td className="p-4 text-center">{s.class}</td>
                <td className="p-4 text-center">{s.year}</td>
                <td className="p-4 text-center">{s.part}</td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${s.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {s.is_active ? "Active" : "Inactive"}
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
