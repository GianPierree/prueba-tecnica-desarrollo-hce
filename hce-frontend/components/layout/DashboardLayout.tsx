import { useEffect } from "react";
import { useRouter } from "next/router";
import NavigationMenu from "./NavigationMenu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("hce_token")) router.replace("/login");
  }, [router]);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
