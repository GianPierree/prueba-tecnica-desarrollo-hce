import api from "@/lib/utils/api";
import { Product, CreateProductDto, UpdateProductDto } from "@/types/product.types";

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  create: async (dto: CreateProductDto): Promise<Product> => {
    const { data } = await api.post<Product>("/products", dto);
    return data;
  },

  update: async (id: number, dto: UpdateProductDto): Promise<Product> => {
    const { data } = await api.put<Product>(`/products/${id}`, dto);
    return data;
  },
};