export interface SaleDetail {
  producto_id: string; nombre_producto: string;
  cantidad: number; precio_unitario: number; subtotal: number;
}
export interface Sale {
  id: string; numero_venta: string; cliente: string; fecha: string;
  detalles: SaleDetail[]; subtotal: number; igv: number; total: number; created_at: string;
}
export interface CreateSaleDto {
  cliente: string; fecha: string;
  detalles: Omit<SaleDetail, 'nombre_producto'>[];
}
