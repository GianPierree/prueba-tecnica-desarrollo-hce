import { Products } from '@app/database';

export interface SaleDetailPayload {
  Id_producto: number;
  Cantidad: number;
  Precio: number;
}

export interface CreateSalePayload {
  detalles: SaleDetailPayload[];
}

export interface ProcessedDetail {
  Id_producto: number;
  Cantidad: number;
  Precio: number;
  Sub_Total: number;
  Igv: number;
  Total: number;
  ProductoEntidad: Products;
}
