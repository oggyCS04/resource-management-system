"use client"

import { useState } from "react"

export default function AddTeacherModal({ open, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role_id: 1,
    is_active: true,
    department_id: 1,
  })

  if (!open) return null

  const submit = async () => {
    console.log(JSON.stringify(form))

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
          Add New Teacher
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
          <label className="mb-4">Department
            <select
              className="w-full border rounded px-3 py-2"
              onChange={(e) =>
                setForm({ ...form, department_id: Number(e.target.value) })
              }
            >
              <option value={1}>Electronics and Computer Engineering</option>
              <option value={2}>Architecture</option>
              <option value={3}>Applied Science</option>
              <option value={4}>utomobile and Mechanical Engineering</option>
              <option value={5}>Civil Engineering</option>
              <option value={6}>Industrial Engineering</option>
            </select></label>

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
