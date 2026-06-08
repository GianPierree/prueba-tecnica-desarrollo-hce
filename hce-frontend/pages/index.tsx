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
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Arquitectura Microfrontend activa</h2>
        <p className="text-sm text-gray-600 mb-3">Module Federation con <code className="bg-gray-100 px-1 rounded">@module-federation/nextjs-mf@8.1.10</code> sobre Next.js 14 (Pages Router).</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[{l:"hce_frontend",p:"3000",d:"Host + Remote"},{l:"hce_purchases",p:"3001",d:"Remote Compras"},{l:"hce_sales",p:"3002",d:"Remote Ventas"},{l:"hce_kardex",p:"3003",d:"Remote Kardex"}].map(r => (
            <div key={r.l} className="bg-gray-50 rounded-lg p-3">
              <p className="font-mono font-medium text-blue-700">{r.l}</p>
              <p className="text-gray-500">:{r.p}</p>
              <p className="text-gray-400 mt-1">{r.d}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
