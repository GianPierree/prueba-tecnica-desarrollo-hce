import api from "@/lib/utils/api";
import { Purchase, CreatePurchaseDto, PurchaseResponse } from "@/types/purchase.types";

export const purchasesService = {
  getAll: async (): Promise<Purchase[]> => {
    const { data } = await api.get<PurchaseResponse>("/purchases");
    return data.data;
  },

  create: async (dto: CreatePurchaseDto): Promise<Purchase> => {
    const { data } = await api.post<Purchase>("/purchases", dto);
    return data;
  },
};