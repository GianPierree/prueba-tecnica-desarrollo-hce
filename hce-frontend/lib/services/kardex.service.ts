import api from "@/lib/utils/api";
import { 
  KardexEntry,
  KardexMovement,
  KardexMovementResponse,
  KardexResponse 
} from "@/types/kardex.types";

export const kardexService = {
  getAll: async (): Promise<KardexEntry[]> => {
    const { data } = await api.get<KardexResponse>("/kardex");
    return data.data;
  },

  getMovementsByProduct: async (id: number): Promise<KardexMovement[]> => {
    const { data } = await api.get<KardexMovementResponse>(`/kardex/movements/${id}`);
    return data.data;
  },
};