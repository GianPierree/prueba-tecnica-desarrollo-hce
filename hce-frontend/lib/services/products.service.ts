import { mockProducts } from "@/lib/mock/products.mock";
import { Product, CreateProductDto, UpdateProductDto } from "@/types/product.types";
let products: Product[] = [...mockProducts];
export const productsService = {
  getAll: async (): Promise<Product[]> => [...products],
  getById: async (id: string) => products.find(p => p.id === id),
  create: async (dto: CreateProductDto): Promise<Product> => {
    const p: Product = { id: String(products.length+1), ...dto, stock:0, precio_venta: parseFloat((dto.costo*1.35).toFixed(2)), activo:true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    products.push(p); return p;
  },
  update: async (dto: UpdateProductDto): Promise<Product> => {
    const i = products.findIndex(p => p.id === dto.id);
    if (i === -1) throw new Error("Producto no encontrado");
    products[i] = { ...products[i], ...dto, updated_at: new Date().toISOString() };
    if (dto.costo) products[i].precio_venta = parseFloat((dto.costo*1.35).toFixed(2));
    return products[i];
  },
  updateCostAndPrice: async (id: string, cost: number) => {
    const i = products.findIndex(p => p.id === id);
    if (i !== -1) { products[i].costo = cost; products[i].precio_venta = parseFloat((cost*1.35).toFixed(2)); products[i].updated_at = new Date().toISOString(); }
  },
};
