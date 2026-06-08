import api from "@/lib/utils/api";
import { Product, CreateProductDto, UpdateProductDto, ProductResponse } from "@/types/product.types";

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<ProductResponse>("/products");
    return data.data;
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