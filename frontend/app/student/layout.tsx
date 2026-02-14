"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";

export default function SstudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const router = useRouter();

  const logout = () => {
    document.cookie = "token=; path=/; max-age=0";
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen">
        <div className="absolute flex items-center right-4 top-6 gap-3 ">
          <button
            onClick={logout}
            className="inline-flex items-center justify-center h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Logout
          </button>
          <ThemeToggle />
        </div>
        <div className="p-4 pt-16 sm:p-6 sm:pt-16 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}