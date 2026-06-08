import api from "@/lib/utils/api";
import { Sale, CreateSaleDto } from "@/types/sale.types";

export const salesService = {
  getAll: async (): Promise<Sale[]> => {
    const { data } = await api.get<Sale[]>("/sales");
    return data;
  },

  create: async (dto: CreateSaleDto): Promise<Sale> => {
    const { data } = await api.post<Sale>("/sales", dto);
    return data;
  },
};