"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

type ClassItem = {
    class_id: number
    class_name: string
    year: number
    semester: string
    department_name: string
    resource_count: number
}

export default function TeacherDashboard() {
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teacher/classes`, { credentials: 'include' })
                const data = await res.json()
                setClasses(data.classes || [])
            } catch (error) {
                console.error("Failed to fetch classes:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchClasses()
    }, [])

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Teacher Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Select a class to manage resources</p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-40 rounded-xl skeleton" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((c) => (
                            <Link
                                key={c.class_id}
                                href={`/teacher/${c.class_id}`}
                                className="group block p-6 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                                            {c.department_name}
                                        </span>
                                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {c.class_name}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-primary"><path d="m9 18 6-6-6-6" /></svg>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Year/Sem</span>
                                        <span className="font-medium text-foreground">{c.year} - {c.semester}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Resources</span>
                                        <span className="font-medium text-foreground">{c.resource_count}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {classes.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground">No classes found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
