export interface Product {
  id: string; codigo: string; nombre: string; descripcion?: string;
  stock: number; costo: number; precio_venta: number;
  categoria: string; unidad_medida: string; activo: boolean;
  created_at: string; updated_at: string;
}
export interface CreateProductDto {
  codigo: string; nombre: string; descripcion?: string;
  costo: number; categoria: string; unidad_medida: string;
}
export interface UpdateProductDto extends Partial<CreateProductDto> { id: string; }
