"use client"
import { useEffect, useState } from "react"
import AddTeacherModal from "./addTeacherModal"
import AddStudentModal from "./addStudentModal"
import { EditButton, DeleteButton } from "@/components/button"

type User = {
  id: number
  full_name: string
  email: string
  role_id: number
  is_active: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [openTeacher, setOpenTeacher] = useState(false)
  const [openStudent, setOpenStudent] = useState(false)

  const fetchUsers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
    const data = await res.json()
    setUsers(data.users)

  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 0);
    return () => clearTimeout(timer);
  }, [])

  const handleEdit = () => {
    alert("Edit user functionality to be implemented")
  }

  const handleDelete = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      fetch(`http://localhost:8000/users/${userId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => fetchUsers())
        .catch((err) => alert("Error deleting user: " + err.message))
    }
  }

  return (

    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Users</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setOpenStudent(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            + Add Student
          </button>
          <button
            onClick={() => setOpenTeacher(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Teacher
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-indigo-600">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-center">Role</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center w-64">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{u.id}</td>
                <td className="p-4">{u.full_name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4 text-center">
                  {u.role_id === 1 ? "Teacher" : "Student"}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${u.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <EditButton onClick={handleEdit} />
                    <DeleteButton onClick={() => handleDelete(u.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddTeacherModal
        open={openTeacher}
        onClose={() => setOpenTeacher(false)}
        onSuccess={fetchUsers}
      />
      <AddStudentModal
        open={openStudent}
        onClose={() => setOpenStudent(false)}
        onSuccess={fetchUsers}
      />
    </div>
  )
}
