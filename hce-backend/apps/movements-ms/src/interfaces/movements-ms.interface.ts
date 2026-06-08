export interface MovementDetailPayload {
  Id_producto: number;
  Cantidad: number;
}

export interface RegisterMovementPayload {
  Id_TipoMovimiento: number;
  Id_DocumentoOrigen: number;
  detalles: MovementDetailPayload[];
}
