"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

type Resource = {
    resource_id: number
    description: string
    date_uploaded: string
    file_name: string
    file_type: string
    file_id: number
    uploaded_by_name: string | null
}

type ClassDetails = {
    class_name: string
    department_name: string
}

export default function ClassResourcesPage() {
    const params = useParams()
    const classId = params?.classId as string
    const router = useRouter()

    const [resources, setResources] = useState<Resource[]>([])
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<"upload" | "link">("upload")

    // Upload Form State
    const [description, setDescription] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Link Form State
    const [linkSearchQuery, setLinkSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null)
    const [linkDescription, setLinkDescription] = useState("")
    const [isSearching, setIsSearching] = useState(false)

    const fetchData = async () => {
        try {
            setIsLoading(true)
            const [classRes, resRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/classes/${classId}`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/classes/${classId}/resources`)
            ])

            if (classRes.ok) {
                const classData = await classRes.json()
                setClassDetails(classData)
            }

            if (resRes.ok) {
                const resData = await resRes.json()
                setResources(resData.resources || [])
            }

        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (classId) {
            fetchData()
        }
    }, [classId])

    // --- Upload Logic ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile || !description) return

        setIsSubmitting(true)
        try {
            // 1. Upload File
            const formData = new FormData()
            formData.append("file", selectedFile)

            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload`, {
                method: "POST",
                body: formData
            })

            if (!uploadRes.ok) throw new Error("File upload failed")

            const uploadData = await uploadRes.json()
            const fileId = uploadData.file_id

            // 2. Create Resource linked to class
            const resourceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/resources`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file_id: fileId,
                    description: description,
                    class_id: parseInt(classId),
                    uploaded_by: 1 // Default ID
                })
            })

            if (!resourceRes.ok) throw new Error("Resource creation failed")

            // Reset and refresh
            setIsModalOpen(false)
            setDescription("")
            setSelectedFile(null)
            fetchData()

        } catch (error) {
            alert("Error uploading resource: " + error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- Link Logic ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (linkSearchQuery.length > 2) {
                setIsSearching(true)
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/resources/search?query=${linkSearchQuery}`)
                    const data = await res.json()
                    setSearchResults(data.resources || [])
                } catch (err) {
                    console.error(err)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchResults([])
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [linkSearchQuery])

    const handleLink = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedResourceId) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/resources/link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resource_id: selectedResourceId,
                    class_id: parseInt(classId),
                    description: linkDescription || null // Send null if empty to use original
                })
            })

            if (!res.ok) throw new Error("Linking failed")

            setIsModalOpen(false)
            setLinkDescription("")
            setLinkSearchQuery("")
            setSelectedResourceId(null)
            fetchData()

        } catch (error) {
            alert("Error linking resource: " + error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDownload = async (fileId: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${fileId}`)
            const data = await res.json()
            if (data.download_url) {
                window.open(data.download_url, "_blank")
            } else {
                alert("Could not get download URL")
            }
        } catch (e) {
            alert("Error downloading file")
        }
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link href="/teacher" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6" /></svg>
                            Back to Classes
                        </Link>
                        {isLoading ? (
                            <div className="h-8 w-64 skeleton mt-1 rounded-lg"></div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-foreground tracking-tight">{classDetails?.class_name}</h1>
                                <p className="text-muted-foreground">{classDetails?.department_name}</p>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><path d="M12 5v14M5 12h14" /></svg>
                        Add Resource
                    </button>
                </div>

                {/* Resource List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {resources.length === 0 ? (
                            <div className="text-center py-20 bg-card border border-border rounded-xl">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                </div>
                                <h3 className="text-lg font-medium text-foreground">No resources yet</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-1">Upload files or link existing resources to share with students.</p>
                            </div>
                        ) : (
                            resources.map(res => (
                                <div key={res.resource_id} className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-all group">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-lg text-foreground">{res.description}</h3>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                    {res.file_type.split('/')[1] || 'file'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                {res.file_name}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Uploaded by {res.uploaded_by_name || 'Teacher'}</span>
                                                <span>•</span>
                                                <span>{new Date(res.date_uploaded).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDownload(res.file_id)}
                                            className="shrink-0 h-10 px-4 flex items-center justify-center border border-border bg-background hover:bg-muted text-foreground rounded-lg transition-colors font-medium text-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="flex border-b border-border">
                                <button
                                    className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-card text-primary border-b-2 border-primary' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
                                    onClick={() => setActiveTab('upload')}
                                >
                                    Upload New File
                                </button>
                                <button
                                    className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'link' ? 'bg-card text-primary border-b-2 border-primary' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
                                    onClick={() => setActiveTab('link')}
                                >
                                    Link Existing
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'upload' ? (
                                    <form onSubmit={handleUpload} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Description</label>
                                            <input
                                                type="text"
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="e.g. Lecture 1 Slides"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">File</label>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                required
                                            />
                                        </div>
                                        <div className="pt-4 flex gap-3 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="h-10 px-4 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !selectedFile || !description}
                                                className="h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm shadow-primary/20"
                                            >
                                                {isSubmitting ? "Uploading..." : "Upload Resource"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleLink} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Search Resource</label>
                                            <input
                                                type="text"
                                                value={linkSearchQuery}
                                                onChange={e => setLinkSearchQuery(e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="Search by description or filename..."
                                            />
                                        </div>

                                        <div className="max-h-40 overflow-y-auto border border-border rounded-xl bg-muted/20">
                                            {isSearching && <div className="p-3 text-xs text-muted-foreground">Searching...</div>}
                                            {!isSearching && searchResults.length === 0 && linkSearchQuery.length > 2 && (
                                                <div className="p-3 text-xs text-muted-foreground">No results found</div>
                                            )}
                                            {searchResults.map(res => (
                                                <div
                                                    key={res.resource_id}
                                                    onClick={() => setSelectedResourceId(res.resource_id)}
                                                    className={`p-3 cursor-pointer border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${selectedResourceId === res.resource_id ? 'bg-primary/10' : ''}`}
                                                >
                                                    <div className="text-sm font-medium">{res.description}</div>
                                                    <div className="text-xs text-muted-foreground">{res.file_name}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">New Description (Optional)</label>
                                            <input
                                                type="text"
                                                value={linkDescription}
                                                onChange={e => setLinkDescription(e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="Leave empty to keep original description"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Useful if you want to rename it for this specific class.</p>
                                        </div>

                                        <div className="pt-4 flex gap-3 justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="h-10 px-4 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || !selectedResourceId}
                                                className="h-10 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm shadow-primary/20"
                                            >
                                                {isSubmitting ? "Linking..." : "Link Resource"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
