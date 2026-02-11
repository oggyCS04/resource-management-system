import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  const stats = [
    { label: "Total Students", value: "—", icon: "🎓", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Total Teachers", value: "—", icon: "👨‍🏫", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Departments", value: "—", icon: "🏛️", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { label: "Resources", value: "—", icon: "📚", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
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
        {stats.map((stat) => (
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
              {stat.value}
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
