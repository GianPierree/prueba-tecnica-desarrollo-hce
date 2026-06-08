export interface SaleDetailDto {
  Id_producto: number;
  Cantidad: number;
  Precio: number;
}

export interface CreateSaleDto {
  detalles: SaleDetailDto[];
}

export interface SaleDetail {
  Id_VentaDet: number;
  Id_producto: number;
  Cantidad: number;
  Precio: number;
  Sub_Total: number;
  Igv: number;
  Total: number;
}

export interface Sale {
  Id_VentaCab: number;
  fecRegistro: string;
  SubTotal: number;
  Igv: number;
  Total: number;
  detalles: SaleDetail[];
}