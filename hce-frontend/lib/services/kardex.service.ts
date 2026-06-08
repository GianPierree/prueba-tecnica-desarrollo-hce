import { mockMovements } from "@/lib/mock/movements.mock";
import { mockProducts } from "@/lib/mock/products.mock";
import { KardexMovement, KardexEntry, MovementType } from "@/types/kardex.types";
let movements: KardexMovement[] = [...mockMovements];
export const kardexService = {
  getAll: async (): Promise<KardexEntry[]> => mockProducts.map(p => {
    const mv = movements.filter(m => m.producto_id === p.id);
    return { producto_id:p.id, codigo_producto:p.codigo, nombre_producto:p.nombre, stock_actual:p.stock, costo_promedio:p.costo, valor_inventario:p.stock*p.costo, total_entradas:mv.filter(m=>m.tipo===1).reduce((s,m)=>s+m.cantidad,0), total_salidas:mv.filter(m=>m.tipo===2).reduce((s,m)=>s+m.cantidad,0) };
  }),
  getMovementsByProduct: async (id: string) => movements.filter(m => m.producto_id === id),
  getStock: async (id: string) => mockProducts.find(p => p.id === id)?.stock ?? 0,
  addMovement: async (productoId: string, tipo: MovementType, cantidad: number, costoUnitario: number, referencia: string): Promise<KardexMovement> => {
    const product = mockProducts.find(p => p.id === productoId);
    const prev = product?.stock ?? 0;
    const next = tipo === 1 ? prev + cantidad : prev - cantidad;
    const m: KardexMovement = { id:`m${movements.length+1}`, producto_id:productoId, tipo, tipo_label:tipo===1?"Entrada":"Salida", cantidad, costo_unitario:costoUnitario, stock_anterior:prev, stock_actual:next, referencia, fecha:new Date().toISOString().split("T")[0], created_at:new Date().toISOString() };
    movements.push(m);
    if (product) product.stock = next;
    return m;
  },
};
