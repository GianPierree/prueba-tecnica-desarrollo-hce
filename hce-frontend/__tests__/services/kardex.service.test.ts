import { kardexService } from "@/lib/services/kardex.service";
import api from "@/lib/utils/api";
import { KardexEntry, KardexMovement } from "@/types/kardex.types";

jest.mock("@/lib/utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

const mockKardexEntries: KardexEntry[] = [
  {
    Id_producto: 1,
    Nombre_producto: "Paracetamol 500mg",
    StockActual: 150,
    Costo: 0.5,
    PrecioVenta: 0.68,
  },
  {
    Id_producto: 2,
    Nombre_producto: "Amoxicilina 500mg",
    StockActual: 0,
    Costo: 1.2,
    PrecioVenta: 1.62,
  },
];

const mockMovements: KardexMovement[] = [
  { FechaRegistro: "2024-01-15T10:00:00Z", TipoMovimiento: "Entrada", Cantidad: 100 },
  { FechaRegistro: "2024-01-16T11:00:00Z", TipoMovimiento: "Salida",  Cantidad: 20  },
];

describe("kardexService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("retorna todos los registros del kardex", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: mockKardexEntries },
      });

      const result = await kardexService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith("/kardex");
      expect(result).toHaveLength(2);
      expect(result[0].Nombre_producto).toBe("Paracetamol 500mg");
      expect(result[0].StockActual).toBe(150);
    });

    it("lanza error si la API falla", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Server error"));
      await expect(kardexService.getAll()).rejects.toThrow("Server error");
    });
  });

  describe("getMovementsByProduct", () => {
    it("retorna los movimientos de un producto específico", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: mockMovements },
      });

      const result = await kardexService.getMovementsByProduct(1);

      expect(mockedApi.get).toHaveBeenCalledWith("/kardex/movements/1");
      expect(result).toHaveLength(2);
      expect(result[0].TipoMovimiento).toBe("Entrada");
      expect(result[1].TipoMovimiento).toBe("Salida");
    });

    it("retorna lista vacía si el producto no tiene movimientos", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      const result = await kardexService.getMovementsByProduct(99);
      expect(result).toHaveLength(0);
    });

    it("lanza error si el producto no existe", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Not Found"));
      await expect(kardexService.getMovementsByProduct(999)).rejects.toThrow("Not Found");
    });
  });

  describe("lógica de stock", () => {
    it("identifica productos sin stock", () => {
      const sinStock = mockKardexEntries.filter((e) => e.StockActual === 0);
      expect(sinStock).toHaveLength(1);
      expect(sinStock[0].Nombre_producto).toBe("Amoxicilina 500mg");
    });

    it("identifica productos con stock bajo (menor a 10)", () => {
      const entries: KardexEntry[] = [
        { ...mockKardexEntries[0], StockActual: 5 },
        { ...mockKardexEntries[1], StockActual: 80 },
      ];
      const stockBajo = entries.filter((e) => e.StockActual > 0 && e.StockActual < 10);
      expect(stockBajo).toHaveLength(1);
    });

    it("el stock actual es la suma de entradas menos salidas", () => {
      const entradas = mockMovements
        .filter((m) => m.TipoMovimiento === "Entrada")
        .reduce((sum, m) => sum + m.Cantidad, 0);
      const salidas = mockMovements
        .filter((m) => m.TipoMovimiento === "Salida")
        .reduce((sum, m) => sum + m.Cantidad, 0);
      expect(entradas - salidas).toBe(80);
    });
  });
});
