"use client";
import {useEffect, useState } from "react"
import UploadFiles from "./uploadFiles"

type File = {
    file_id: number,
    file_name: string,
    file_type: string,
    uploaded_by: string,
    uploaded_at: string,
}

export default function FilesPage() {
    const [files, setFiles] = useState<File[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [openUpload, setOpenUpload] = useState(false)
    const [filterType, setFilterType] = useState("All Types")
    const [searchQuery, setSearchQuery] = useState("")


    const fetchFiles = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/`)
            const data = await res.json()
            setFiles(data.files || [])
        } catch (error) {
            console.error("Failed to fetch files:", error)
            setFiles([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFiles()
    }, [])

    const filteredFiles = files.filter(f => {
        const matchesType = filterType === "All Types" || f.file_type === filterType
        const matchesSearch = f.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    const fileTypes = ["All Types", ...new Set(files.map(f => f.file_type))]

    const handleEdit = () => {
        alert("Edit user functionality to be implemented")
    }

    const handleDelete = (fileId: number) => {
        if (confirm("Are you sure you want to delete this file?")) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${fileId}`, {
                method: "DELETE",
            })
                .then((res) => res.json())
                .then(() => fetchFiles())
                .catch((err) => alert("Error deleting file: " + err.message))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Files</h1>
                    <p className="text-sm text-muted-foreground mt-1">{files.length} total files</p>
                </div>
                <button
                    onClick={() => setOpenUpload(true)}
                    className="inline-flex items-center justify-center h-10 px-4 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M12 5v14M5 12h14" /></svg>
                    Add File
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:max-w-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 border border-input rounded-xl bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="h-10 px-4 border border-input rounded-xl bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                    {fileTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div>
            ) : (
                <>
                    {/* Desktop */}
                    <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">File Name</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uploaded By</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredFiles.map((r) => (
                                        <tr key={r.file_id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-5 py-3.5 text-sm text-foreground font-medium">{r.file_id}</td>
                                            <td className="px-5 py-3.5 text-sm text-foreground font-medium">{r.file_name}</td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                                    {r.file_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.uploaded_by}</td>
                                            <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.uploaded_at}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                <div className="flex gap-1.5 justify-center">
                                                    <button onClick={handleEdit} className="h-8 px-3 text-xs font-medium text-foreground bg-muted rounded-lg hover:bg-accent transition-colors">View</button>
                                                    <button onClick={() => handleDelete(r.file_id)} className="h-8 px-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">Delete</button>
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
                        {filteredFiles.map((r) => (
                            <div key={r.file_id} className="bg-card border border-border rounded-xl p-4 space-y-2">
                                <div className="flex items-start justify-between">
                                    <p className="font-semibold text-foreground">{r.file_name}</p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                        {r.file_type}
                                    </span>
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                                    <span>By: <strong className="text-foreground">{r.uploaded_by}</strong></span>
                                    <span>{r.uploaded_at}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => handleEdit} className="h-8 px-3 text-xs font-medium text-foreground bg-muted rounded-lg hover:bg-accent transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(r.file_id)} className="h-8 px-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredFiles.length === 0 && (
                        <div className="text-center py-16 bg-card border border-border rounded-xl">
                            <p className="text-muted-foreground text-sm">No files found</p>
                        </div>
                    )}
                </>
            )}
            
            <UploadFiles open={openUpload} onClose={() => setOpenUpload(false)} onSuccess={fetchFiles} />
        </div>
    )
}