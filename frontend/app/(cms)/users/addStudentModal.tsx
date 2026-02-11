"use client"

import { useState } from "react"

export default function AddStudentModal({ open, onClose, onSuccess }: any) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    class_id: 1,
    campus_rollno: "",
    role_id: 2,
    is_active: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  if (!open) return null

  const submit = async () => {
    setIsLoading(true)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Failed to add student:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-border shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add New Student</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Enter student details below</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input
              className="w-full h-10 px-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Jane Smith"
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              className="w-full h-10 px-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="jane.smith@example.com"
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input
              className="w-full h-10 px-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="••••••••"
              type="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Class ID</label>
              <input
                className="w-full h-10 px-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="1"
                type="number"
                onChange={(e) => setForm({ ...form, class_id: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Campus Roll No</label>
              <input
                className="w-full h-10 px-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="CS2024001"
                onChange={(e) => setForm({ ...form, campus_rollno: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="active-student"
              checked={form.is_active}
              className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <label htmlFor="active-student" className="text-sm font-medium text-foreground cursor-pointer">Active</label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-2.5 rounded-b-2xl sticky bottom-0">
          <button
            onClick={onClose}
            className="h-10 px-4 text-sm font-medium text-foreground bg-card border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isLoading}
            className="h-10 px-5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? "Adding..." : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  )
}