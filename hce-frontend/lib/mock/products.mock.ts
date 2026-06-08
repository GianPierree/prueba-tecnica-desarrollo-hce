import { Product } from "@/types/product.types";
export const mockProducts: Product[] = [
  { id:"1", codigo:"MED-001", nombre:"Paracetamol 500mg", descripcion:"Analgésico y antipirético", stock:150, costo:0.50, precio_venta:0.68, categoria:"Medicamentos", unidad_medida:"Tableta", activo:true, created_at:"2024-01-10T00:00:00Z", updated_at:"2024-01-10T00:00:00Z" },
  { id:"2", codigo:"MED-002", nombre:"Amoxicilina 500mg", descripcion:"Antibiótico de amplio espectro", stock:80, costo:1.20, precio_venta:1.62, categoria:"Medicamentos", unidad_medida:"Cápsula", activo:true, created_at:"2024-01-10T00:00:00Z", updated_at:"2024-01-10T00:00:00Z" },
  { id:"3", codigo:"MAT-001", nombre:"Jeringa 5ml", descripcion:"Jeringa desechable con aguja", stock:500, costo:0.30, precio_venta:0.41, categoria:"Material Médico", unidad_medida:"Unidad", activo:true, created_at:"2024-01-10T00:00:00Z", updated_at:"2024-01-10T00:00:00Z" },
  { id:"4", codigo:"MAT-002", nombre:"Guantes de látex M", descripcion:"Guantes desechables talla M", stock:200, costo:0.80, precio_venta:1.08, categoria:"Material Médico", unidad_medida:"Par", activo:true, created_at:"2024-01-10T00:00:00Z", updated_at:"2024-01-10T00:00:00Z" },
];
