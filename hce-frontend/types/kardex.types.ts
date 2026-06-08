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
  Id_MovimientoDet: number;
  Id_MovimientoCab: number;
  Id_producto: number;
  Cantidad: number;
  Fec_registro: string;
  Id_TipoMovimiento: 1 | 2;
}

export interface KardexMovementResponse {
  success: boolean;
  data: KardexMovement[]; 
}