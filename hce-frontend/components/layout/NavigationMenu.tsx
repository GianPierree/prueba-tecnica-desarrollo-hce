"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { addToast } from "@heroui/react";
import { authService } from "@/lib/services/auth.service";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/dashboard/purchases", label: "Nueva Compra" },
  { href: "/dashboard/purchases-list", label: "Compras" },
  { href: "/dashboard/sales", label: "Nueva Venta" },
  { href: "/dashboard/sales-list", label: "Ventas" },
  { href: "/dashboard/kardex", label: "Kardex" },
  { href: "/dashboard/products", label: "Productos" },
];

export default function NavigationMenu() {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    addToast({ title: "Sesión cerrada", color: "default" });
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-xl">HCE</span>
            <span className="text-gray-500 text-sm hidden sm:block">Sistema de Gestión</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? router.pathname === "/"
                  : router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <button
            onClick={handleLogout}
            className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
