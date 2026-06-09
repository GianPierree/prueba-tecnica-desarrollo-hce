import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavigationMenu from "./NavigationMenu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("hce_token");
    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!mounted || !checked) return null;

  const isHome = router.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isHome && (
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
