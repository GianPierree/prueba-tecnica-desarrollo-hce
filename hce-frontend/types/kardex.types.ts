export type MovementType = 1 | 2;
export interface KardexMovement {
  id: string; producto_id: string; tipo: MovementType; tipo_label: string;
  cantidad: number; costo_unitario: number; stock_anterior: number; stock_actual: number;
  referencia: string; fecha: string; created_at: string;
}
export interface KardexEntry {
  producto_id: string; codigo_producto: string; nombre_producto: string;
  stock_actual: number; costo_promedio: number; valor_inventario: number;
  total_entradas: number; total_salidas: number;
}
