export interface PurchaseDetailDto {
  Id_producto: number;
  Cantidad: number;
  Precio: number;
}

export interface CreatePurchaseDto {
  detalles: PurchaseDetailDto[];
}

export interface PurchaseDetail {
  Id_CompraDet: number;
  Id_producto: number;
  Cantidad: number;
  Precio: number;
  Sub_Total: number;
  Igv: number;
  Total: number;
}

export interface PurchaseResponse {
  data: Purchase[];
  success: boolean;
}

export interface Purchase {
  Id_CompraCab: number;
  FecRegistro: string;
  SubTotal: number;
  Igv: number;
  Total: number;
  detalles: PurchaseDetail[];
}