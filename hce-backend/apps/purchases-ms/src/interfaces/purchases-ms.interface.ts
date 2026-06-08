import { Products } from '@app/database';

export interface PurchaseDetailPayload {
  Id_producto: number;
  Cantidad: number;
  Precio: number;
}

export interface CreatePurchasePayload {
  detalles: PurchaseDetailPayload[];
}

export interface ProcessedPurchaseDetail {
  Id_producto: number;
  Cantidad: number;
  Precio: number;
  Sub_Total: number;
  Igv: number;
  Total: number;
  ProductoEntidad: Products;
}
