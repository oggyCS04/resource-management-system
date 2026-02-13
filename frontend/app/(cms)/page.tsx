'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    departments: 0,
    classes: 0,
    resources: 0,
  });
  const [loading, setLoading] = useState(true);

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

  const quickActions = [
    { label: 'Add Student', href: '/users', icon: '➕' },
    { label: 'Add Teacher', href: '/users', icon: '➕' },
    { label: 'View Resources', href: '/resources', icon: '📋' },
    { label: 'Departments', href: '/departments', icon: '🏢' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: 'var(--text-heading)' }}
          >
            Welcome back 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Here&apos;s an overview of your college management system.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 rounded-full transition hover:scale-110"
          style={{
            color: 'var(--text-secondary)',
            background: 'var(--bg-hover)',
          }}
          title="Refresh stats"
        >
          🔄
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5 flex items-center justify-between transition"
            style={{
              background: 'var(--bg-card)',
              boxShadow: '0 1px 4px var(--shadow-color)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {card.label}
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: 'var(--text-heading)' }}
              >
                {loading ? '—' : card.value}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${card.color}18` }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--bg-card)',
          boxShadow: '0 1px 4px var(--shadow-color)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h2
          className="text-lg font-semibold mb-5"
          style={{ color: 'var(--text-heading)' }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-3 py-6 rounded-xl text-sm font-medium transition"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <span className="text-2xl">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}