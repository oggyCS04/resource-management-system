"use client"

import { useState } from "react"

export default function AddStudentModal({ open, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    class_id: 1,
    campus_rollno:"",
    role_id: 2,
    is_active: true,
  })

  if (!open) return null

  const submit = async () => {
    
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
    

    onSuccess()
    onClose()
    
  }
  

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-105 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-indigo-600 mb-4">
          Add New Student
        </h2>

        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Full Name"
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Password"
            type="password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Class Id"
            onChange={(e) =>
              setForm({ ...form, class_id: Number(e.target.value) })
            }
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="CampusRollNo"
            onChange={(e) =>
              setForm({ ...form, campus_rollno: e.target.value })
            }
          />
           
        
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Active
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
