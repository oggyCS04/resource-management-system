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
    uploaded_by_name: string | null
}

type StudentInfo = {
    class_id: number
    campus_rollno: string
}

export default function StudentDashboard() {
    const [resources, setResources] = useState<Resource[]>([])
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await authenticatedFetch(`${API_URL}/resources/student`)
                if (!res.ok) {
                    throw new Error("Failed to fetch resources")
                }
                const data = await res.json()
                setResources(data.resources || [])
                setStudentInfo(data.student_info || null)
            } catch (err) {
                console.error("Error:", err)
                setError("Failed to load your resources.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchResources()
    }, [])

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Student Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        {studentInfo ? `Welcome! Access resources for your class (Roll No: ${studentInfo.campus_rollno})` : "Welcome to your dashboard"}
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((res) => (
                            <div
                                key={res.resource_id}
                                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                                        📄
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground uppercase">
                                        {res.file_type}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2" title={res.description}>
                                    {res.description}
                                </h3>

                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p className="flex items-center gap-2">
                                        <span className="w-4 h-4 text-center">👤</span>
                                        {res.uploaded_by_name || "Unknown"}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-4 h-4 text-center">📅</span>
                                        {new Date(res.date_uploaded).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={res.file_name}>
                                        {res.file_name}
                                    </span>
                                    {/* Download/View Button - placeholder functionality since API for download isn't explicitly defined yet but implied */}
                                    <button className="text-sm font-medium text-primary hover:underline">
                                        Download
                                    </button>
                                </div>
                            </div>
                        ))}

                        {resources.length === 0 && !error && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground">No resources found for your class.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
