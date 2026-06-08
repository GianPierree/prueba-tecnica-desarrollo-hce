import { KardexMovement } from "@/types/kardex.types";
export const mockMovements: KardexMovement[] = [
  { id:"m1", producto_id:"1", tipo:1, tipo_label:"Entrada", cantidad:100, costo_unitario:0.50, stock_anterior:50, stock_actual:150, referencia:"COMP-001", fecha:"2024-01-15", created_at:"2024-01-15T10:00:00Z" },
  { id:"m2", producto_id:"1", tipo:2, tipo_label:"Salida", cantidad:20, costo_unitario:0.50, stock_anterior:150, stock_actual:130, referencia:"VENT-001", fecha:"2024-01-16", created_at:"2024-01-16T11:00:00Z" },
  { id:"m3", producto_id:"2", tipo:1, tipo_label:"Entrada", cantidad:50, costo_unitario:1.20, stock_anterior:30, stock_actual:80, referencia:"COMP-002", fecha:"2024-01-15", created_at:"2024-01-15T12:00:00Z" },
  { id:"m4", producto_id:"3", tipo:1, tipo_label:"Entrada", cantidad:300, costo_unitario:0.30, stock_anterior:200, stock_actual:500, referencia:"COMP-003", fecha:"2024-01-16", created_at:"2024-01-16T09:00:00Z" },
  { id:"m5", producto_id:"4", tipo:1, tipo_label:"Entrada", cantidad:200, costo_unitario:0.80, stock_anterior:0, stock_actual:200, referencia:"COMP-004", fecha:"2024-01-17", created_at:"2024-01-17T08:00:00Z" },
];
