import { CreateSaleDto, Sale } from "@/types/sale.types";
import { productsService } from "./products.service";
import { kardexService } from "./kardex.service";
import { calculateTotals } from "@/lib/utils/formatters";
let sales: Sale[] = []; let counter = 1;
export const salesService = {
  getAll: async () => [...sales],
  create: async (dto: CreateSaleDto): Promise<Sale> => {
    const all = await productsService.getAll();
    for (const d of dto.detalles) {
      const stock = await kardexService.getStock(d.producto_id);
      if (stock < d.cantidad) { const p = all.find(x=>x.id===d.producto_id); throw new Error(`Stock insuficiente para "${p?.nombre}". Disponible: ${stock}`); }
    }
    let subtotal = 0;
    const num = `VENT-${String(counter).padStart(3,"0")}`;
    const detalles = await Promise.all(dto.detalles.map(async d => {
      const p = all.find(x=>x.id===d.producto_id);
      const ls = d.cantidad*d.precio_unitario; subtotal += ls;
      await kardexService.addMovement(d.producto_id, 2, d.cantidad, p?.costo??d.precio_unitario, num);
      return { producto_id:d.producto_id, nombre_producto:p?.nombre??"Producto", cantidad:d.cantidad, precio_unitario:d.precio_unitario, subtotal:ls };
    }));
    const { igv, total } = calculateTotals(subtotal);
    const sale: Sale = { id:String(sales.length+1), numero_venta:num, cliente:dto.cliente, fecha:dto.fecha, detalles, subtotal, igv, total, created_at:new Date().toISOString() };
    sales.push(sale); counter++; return sale;
  },
};
