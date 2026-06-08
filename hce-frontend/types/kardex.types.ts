export interface KardexEntry {
  Id_producto: number;
  Nombre_producto: string;
  StockActual: number;
  Costo: number;
  PrecioVenta: number;
}

export interface KardexResponse {
  success: boolean;
  data: KardexEntry[];
}

export interface KardexMovement {
  FechaRegistro: string;
  TipoMovimiento: "Entrada" | "Salida";
  Cantidad: number;
}

export interface KardexMovementResponse {
  success: boolean;
  data: KardexMovement[]; 
}