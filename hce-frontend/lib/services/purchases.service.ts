import { CreatePurchaseDto, Purchase } from "@/types/purchase.types";
import { productsService } from "./products.service";
import { kardexService } from "./kardex.service";
import { calculateTotals } from "@/lib/utils/formatters";
let purchases: Purchase[] = []; let counter = 1;
export const purchasesService = {
  getAll: async () => [...purchases],
  create: async (dto: CreatePurchaseDto): Promise<Purchase> => {
    const all = await productsService.getAll();
    let subtotal = 0;
    const num = `COMP-${String(counter).padStart(3,"0")}`;
    const detalles = await Promise.all(dto.detalles.map(async d => {
      const p = all.find(x => x.id === d.producto_id);
      const ls = d.cantidad * d.costo_unitario; subtotal += ls;
      await productsService.updateCostAndPrice(d.producto_id, d.costo_unitario);
      await kardexService.addMovement(d.producto_id, 1, d.cantidad, d.costo_unitario, num);
      return { producto_id:d.producto_id, nombre_producto:p?.nombre??"Producto", cantidad:d.cantidad, costo_unitario:d.costo_unitario, subtotal:ls };
    }));
    const { igv, total } = calculateTotals(subtotal);
    const purchase: Purchase = { id:String(purchases.length+1), numero_compra:num, proveedor:dto.proveedor, fecha:dto.fecha, detalles, subtotal, igv, total, created_at:new Date().toISOString() };
    purchases.push(purchase); counter++; return purchase;
  },
};
