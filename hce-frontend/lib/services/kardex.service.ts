import api from "@/lib/utils/api";
import { KardexEntry, KardexMovement } from "@/types/kardex.types";

export const kardexService = {
  getAll: async (): Promise<KardexEntry[]> => {
    const { data } = await api.get<KardexEntry[]>("/kardex");
    return data;
  },

  getMovementsByProduct: async (id: number): Promise<KardexMovement[]> => {
    const { data } = await api.get<KardexMovement[]>(`/kardex/movements/${id}`);
    return data;
  },
};