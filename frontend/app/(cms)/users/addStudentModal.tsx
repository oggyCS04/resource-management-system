"use client"

import { useState, useEffect } from "react"

export default function AddStudentModal({ open, onClose, onSuccess, initialData }: any) {
  const [form, setForm] = useState({
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    password: "",
    class_id: initialData?.class_id || 1,
    campus_rollno: initialData?.campus_rollno || "",
    role_id: 2,
    is_active: initialData?.is_active ?? true,
  })

  if (!open) return null

  const submit = async () => {
    const url = initialData
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/${initialData.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/users`

    const method = initialData ? "PATCH" : "POST"

    await fetch(url, {
      method: method,
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
          {initialData ? "Edit Student" : "Add New Student"}
        </h2>

        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) =>
              setForm({ ...form, full_name: e.target.value })
            }
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder={initialData ? "Password (leave blank to keep current)" : "Password"}
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Class Id"
            value={form.class_id}
            onChange={(e) =>
              setForm({ ...form, class_id: Number(e.target.value) })
            }
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="CampusRollNo"
            value={form.campus_rollno}
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
