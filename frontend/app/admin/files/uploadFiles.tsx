"use client"

import { useState, useRef } from "react"

interface UploadFilesModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UploadFilesModal({ open, onClose, onSuccess }: UploadFilesModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const submit = async () => {
    if (files.length === 0) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("file", file)
      })

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
        method: "POST",
        body: formData,
      })
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Failed to upload files:", err)
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
            <h2 className="text-lg font-semibold text-foreground">Upload Files</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Select files to upload</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <label
            htmlFor="file-input"
            className="block w-full cursor-pointer"
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="file-input"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                {" "}or drag and drop
              </p>
            </div>
          </label>

          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Selected Files:
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 pl-4 bg-muted/50 rounded-lg text-sm text-foreground "
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({(file.size / 1024).toFixed(2)} KB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-2.5 rounded-b-2xl sticky bottom-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-10 px-4 text-sm font-medium text-foreground bg-card border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={isLoading || files.length === 0}
            className="h-10 px-5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>
    </div>
  )
}