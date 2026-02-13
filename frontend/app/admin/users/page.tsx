"use client"
import { useEffect, useState } from "react"
import AddTeacherModal from "./addTeacherModal"
import AddStudentModal from "./addStudentModal"

type User = {
  id: number
  full_name: string
  email: string
  role_id: number
  is_active: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openTeacher, setOpenTeacher] = useState(false)
  const [openStudent, setOpenStudent] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")


  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`)
      const data = await res.json()
      setUsers(data.users)
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 0);
    return () => clearTimeout(timer);
  }, [])

  const [selectedUser, setSelectedUser] = useState<any>(null)

  const handleEdit = async (user: User) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`)
      if (!res.ok) throw new Error("Failed to fetch user details")
      const detailedUser = await res.json()

      setSelectedUser(detailedUser)
      if (user.role_id === 1) {
        setOpenTeacher(true)
      } else {
        setOpenStudent(true)
      }
    } catch (error) {
      alert("Error fetching user details")
      console.error(error)
    }
  }

  const handleDelete = (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => fetchUsers())
        .catch((err) => alert("Error deleting user: " + err.message))
    }
  }

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage students and teachers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setOpenStudent(true)}
            className="inline-flex items-center justify-center h-10 px-4 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M12 5v14M5 12h14" /></svg>
            Add Student
          </button>
          <button
            onClick={() => setOpenTeacher(true)}
            className="inline-flex items-center justify-center h-10 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M12 5v14M5 12h14" /></svg>
            Add Teacher
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-sm h-10 pl-10 pr-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">{u.id}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">{u.full_name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role_id === 1
                          ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300"
                          : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                          }`}>
                          {u.role_id === 1 ? "Teacher" : "Student"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${u.is_active
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex gap-1.5 justify-center">

                          <button onClick={() => handleEdit(u)} className="h-8 px-3 text-xs font-medium text-foreground bg-muted rounded-lg hover:bg-accent transition-colors">Edit</button>
                          <button onClick={() => handleDelete(u.id)} className="h-8 px-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{u.full_name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role_id === 1
                    ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300"
                    : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                    }`}>
                    {u.role_id === 1 ? "Teacher" : "Student"}
                  </span>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEdit(u)} className="h-8 px-3 text-xs font-medium text-foreground bg-muted rounded-lg hover:bg-accent transition-colors">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="h-8 px-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No users found</p>
            </div>
          )}
        </>
      )}

      <AddTeacherModal
        key={selectedUser ? `edit-teacher-${selectedUser.id}` : 'add-teacher'}
        open={openTeacher}
        onClose={() => {setOpenTeacher(false) 
          setSelectedUser(null)
        }}
        onSuccess={fetchUsers}
        initialData={selectedUser}
      />

      <AddStudentModal
        key={selectedUser ? `edit-student-${selectedUser.id}` : 'add-student'}
        open={openStudent}
        onClose={() => {setOpenStudent(false)
          setSelectedUser(null)
        }}
        onSuccess={fetchUsers}
        initialData={selectedUser}
      />
    </div>
  )
}
