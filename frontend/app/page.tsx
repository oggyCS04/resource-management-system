import { cookies } from "next/headers";
import Link from "next/link";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const getDashboardPath = () => {
    if (token) return "/admin";

    return "/login";
  };

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Resource Management System
        </h1>

        <Link
          href={getDashboardPath()}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:opacity-90 transition"
        >
            {token ? "Go to Dashboard" : "Login"}
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-3xl animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Centralized Academic Resource Platform
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            A streamlined system designed to manage academic resources,
            organize class materials, and enhance collaboration between
            administrators, teachers, and students.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-4 py-2 rounded-full bg-accent text-accent-foreground)">
              Role-Based Access
            </span>
            <span className="px-4 py-2 rounded-full bg-accent text-accent-foreground">
              Class-wise Resource Targeting
            </span>
            <span className="px-4 py-2 rounded-full bg-accent text-accent-foreground">
              Secure File Management
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground py-6">
        © {new Date().getFullYear()} Resource Management System. All rights reserved.
      </footer>
    </main>
  );
}
