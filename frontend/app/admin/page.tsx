"use client";
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [loading, setLoading] = useState(true);


  const [stats, setStats] = useState({
      students: 0,
      teachers: 0,
      departments: 0,
      classes: 0,
      resources: 0,
    });

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Single endpoint using JOINs to get all counts
      const res = await fetch(`${API_URL}/users/dashboard-stats`);
      const data = await res.json();

      setStats({
        students: data.total_students || 0,
        teachers: data.total_teachers || 0,
        departments: data.total_departments || 0,
        classes: data.total_classes || 0,
        resources: data.total_resources || 0,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

   

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: '🎓', color: '#f59e0b' },
    { label: 'Total Teachers', value: stats.teachers, icon: '👨‍🏫', color: '#3b82f6' },
    { label: 'Departments', value: stats.departments, icon: '🏛️', color: '#ef4444' },
    { label: 'Resources', value: stats.resources, icon: '📚', color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Welcome back 👋
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
          Here&apos;s an overview of your college management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
              {loading ? '-' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: "Add Student", href: "/users", icon: "➕" },
            { label: "Add Teacher", href: "/users", icon: "➕" },
            { label: "View Resources", href: "/resources", icon: "📖" },
            { label: "Departments", href: "/departments", icon: "🏢" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-muted hover:border-primary/20 transition-all text-center group"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}