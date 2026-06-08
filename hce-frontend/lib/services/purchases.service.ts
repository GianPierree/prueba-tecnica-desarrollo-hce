import api from "@/lib/utils/api";
import { Purchase, CreatePurchaseDto } from "@/types/purchase.types";

export const purchasesService = {
  getAll: async (): Promise<Purchase[]> => {
    const { data } = await api.get<Purchase[]>("/purchases");
    return data;
  },

  create: async (dto: CreatePurchaseDto): Promise<Purchase> => {
    const { data } = await api.post<Purchase>("/purchases", dto);
    return data;
  },
};