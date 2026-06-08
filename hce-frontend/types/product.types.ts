export interface Product {
  Id_producto: number;
  Nombre_producto: string;
  NroLote: string;
  Fec_registro: string;
  Costo: number;
  PrecioVenta: number;
}

export interface ProductResponse {
  data: Product[];
  success: true;
}

export interface CreateProductDto {
  Nombre_producto: string;
  NroLote: string;
  Costo: number;
  PrecioVenta?: number;
}

export interface UpdateProductDto {
  Nombre_producto?: string;
  NroLote?: string;
  Costo?: number;
  PrecioVenta?: number;
}