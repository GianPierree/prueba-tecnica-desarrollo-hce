import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

const modules = [
  { href:"/dashboard/purchases", title:"Compras", desc:"Registrar y gestionar órdenes de compra", icon:"🛒", color:"bg-blue-50 border-blue-200 hover:border-blue-400", text:"text-blue-700" },
  { href:"/dashboard/sales",     title:"Ventas",  desc:"Registrar ventas con validación de stock", icon:"💊", color:"bg-green-50 border-green-200 hover:border-green-400", text:"text-green-700" },
  { href:"/dashboard/kardex",    title:"Kardex",  desc:"Control de inventario y movimientos", icon:"📊", color:"bg-purple-50 border-purple-200 hover:border-purple-400", text:"text-purple-700" },
  { href:"/dashboard/products",  title:"Productos",desc:"Catálogo de productos y precios", icon:"📦", color:"bg-orange-50 border-orange-200 hover:border-orange-400", text:"text-orange-700" },
];

export default function Home() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión HCE</h1>
        <p className="mt-1 text-gray-500">Gestión de compras, ventas y control de inventario</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map(m => (
          <Link key={m.href} href={m.href} className={`block p-6 rounded-xl border-2 transition-all duration-200 ${m.color}`}>
            <div className="text-4xl mb-3">{m.icon}</div>
            <h2 className={`text-lg font-semibold mb-1 ${m.text}`}>{m.title}</h2>
            <p className="text-sm text-gray-600">{m.desc}</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
