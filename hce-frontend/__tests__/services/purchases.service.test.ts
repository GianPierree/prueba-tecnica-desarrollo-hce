import { purchasesService } from "@/lib/services/purchases.service";
import api from "@/lib/utils/api";
import { Purchase, CreatePurchaseDto } from "@/types/purchase.types";

jest.mock("@/lib/utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

const mockPurchase: Purchase = {
  Id_CompraCab: 1,
  FecRegistro: "2024-01-15T10:00:00Z",
  SubTotal: 50.0,
  Igv: 9.0,
  Total: 59.0,
  detalles: [
    {
      Id_CompraDet: 1,
      Id_producto: 1,
      Cantidad: 100,
      Precio: 0.5,
      Sub_Total: 50.0,
      Igv: 9.0,
      Total: 59.0,
    },
  ],
};

describe("purchasesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("retorna la lista de compras correctamente", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: [mockPurchase] },
      });

      const result = await purchasesService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith("/purchases");
      expect(result).toHaveLength(1);
      expect(result[0].Id_CompraCab).toBe(1);
      expect(result[0].Total).toBe(59.0);
    });

    it("retorna lista vacía si no hay compras", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      const result = await purchasesService.getAll();
      expect(result).toHaveLength(0);
    });

    it("lanza error si la API falla", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Server error"));
      await expect(purchasesService.getAll()).rejects.toThrow("Server error");
    });
  });

  describe("create", () => {
    it("crea una compra con los detalles correctos", async () => {
      const dto: CreatePurchaseDto = {
        detalles: [{ Id_producto: 1, Cantidad: 100, Precio: 0.5 }],
      };
      mockedApi.post.mockResolvedValueOnce({ data: mockPurchase });

      const result = await purchasesService.create(dto);

      expect(mockedApi.post).toHaveBeenCalledWith("/purchases", dto);
      expect(result.Id_CompraCab).toBe(1);
      expect(result.detalles).toHaveLength(1);
    });

    it("lanza error si los detalles están vacíos", async () => {
      mockedApi.post.mockRejectedValueOnce(
        new Error("Bad Request: detalles must not be empty")
      );
      await expect(purchasesService.create({ detalles: [] })).rejects.toThrow(
        "Bad Request"
      );
    });
  });

  describe("cálculo de totales", () => {
    it("el IGV es el 18% del subtotal", () => {
      const subtotal = 50;
      const igv = subtotal * 0.18;
      expect(igv).toBeCloseTo(9.0);
    });

    it("el total es subtotal + IGV", () => {
      const subtotal = 50;
      const igv = subtotal * 0.18;
      const total = subtotal + igv;
      expect(total).toBeCloseTo(59.0);
    });
  });
});
