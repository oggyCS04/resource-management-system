"use client"
import { useEffect, useState } from "react"
import { authenticatedFetch } from "@/lib/api-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Resource = {
    resource_id: number
    description: string
    date_uploaded: string
    file_name: string
    file_type: string
    file_id: number
    uploaded_by_name: string | null
}

type Subject = {
    subject_id: number
    subject_name: string
    resources: Resource[]
}

export default function StudentDashboard() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [expandedSubject, setExpandedSubject] = useState<number | null>(null)

    useEffect(() => {
        const fetchResources = async () => {
            try {
                // ✅ Updated endpoint
                const res = await authenticatedFetch(`${API_URL}/student/resources`)
                if (!res.ok) {
                    throw new Error("Failed to fetch resources")
                }
                const data = await res.json()
                setSubjects(data.subjects || [])
            } catch (err) {
                console.error("Error:", err)
                setError("Failed to load your resources.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchResources()
    }, [])

    const handleDownload = async (fileId: number) => {
        try {
            const res = await authenticatedFetch(`${API_URL}/files/${fileId}`)
            const data = await res.json()
            window.open(data.download_url, '_blank')
        } catch (error) {
            console.error("Download failed:", error)
            alert("Failed to download file")
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-muted/50 rounded animate-pulse" />
                        <div className="h-4 w-96 bg-muted/50 rounded animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Student Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome! Access resources for your class
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                        {error}
                    </div>
                )}

                {/* Subjects List */}
                <div className="space-y-4">
                    {subjects.map((subject) => (
                        <div key={subject.subject_id} className="border border-border rounded-xl overflow-hidden bg-card">
                            {/* Subject Header */}
                            <button
                                onClick={() => setExpandedSubject(
                                    expandedSubject === subject.subject_id ? null : subject.subject_id
                                )}
                                className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                                        📚
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {subject.subject_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {subject.resources.length} resource{subject.resources.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className={`w-5 h-5 transition-transform text-muted-foreground ${
                                        expandedSubject === subject.subject_id ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Resources List (Expanded) */}
                            {expandedSubject === subject.subject_id && (
                                <div className="border-t border-border bg-muted/30">
                                    {subject.resources.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground text-sm">
                                                No resources available yet
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-4 space-y-3">
                                            {subject.resources.map((resource) => (
                                                <div
                                                    key={resource.resource_id}
                                                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        {/* Resource Info */}
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                                                    {resource.file_type?.split('/')[1]?.toUpperCase().slice(0, 3) || 'FILE'}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-foreground mb-1 truncate">
                                                                    {resource.description}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground truncate mb-2">
                                                                    {resource.file_name}
                                                                </p>
                                                                <div className="flex gap-4 text-xs text-muted-foreground">
                                                                    <span className="flex items-center gap-1">
                                                                        👤 {resource.uploaded_by_name || "Unknown"}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        📅 {new Date(resource.date_uploaded).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Download Button */}
                                                        <button
                                                            onClick={() => handleDownload(resource.file_id)}
                                                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium whitespace-nowrap"
                                                        >
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* No Subjects Message */}
                    {subjects.length === 0 && !error && (
                        <div className="text-center py-16 bg-card border border-border rounded-xl">
                            <div className="text-6xl mb-4">📚</div>
                            <p className="text-muted-foreground text-lg">No subjects found for your class</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}