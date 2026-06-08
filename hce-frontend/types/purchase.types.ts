export interface PurchaseDetail {
  producto_id: string; nombre_producto: string;
  cantidad: number; costo_unitario: number; subtotal: number;
}
export interface Purchase {
  id: string; numero_compra: string; proveedor: string; fecha: string;
  detalles: PurchaseDetail[]; subtotal: number; igv: number; total: number; created_at: string;
}
export interface CreatePurchaseDto {
  proveedor: string; fecha: string;
  detalles: Omit<PurchaseDetail, 'nombre_producto'>[];
}
