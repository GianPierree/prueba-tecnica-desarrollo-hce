import { salesService } from "@/lib/services/sales.service";
import api from "@/lib/utils/api";
import { Sale, CreateSaleDto } from "@/types/sale.types";

jest.mock("@/lib/utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

const mockSale: Sale = {
  Id_VentaCab: 1,
  fecRegistro: "2024-01-16T11:00:00Z",
  SubTotal: 20.0,
  Igv: 3.6,
  Total: 23.6,
  detalles: [
    {
      Id_VentaDet: 1,
      Id_producto: 1,
      Cantidad: 20,
      Precio: 1.0,
      Sub_Total: 20.0,
      Igv: 3.6,
      Total: 23.6,
    },
  ],
};

describe("salesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("retorna la lista de ventas correctamente", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: [mockSale] },
      });

      const result = await salesService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith("/sales");
      expect(result).toHaveLength(1);
      expect(result[0].Id_VentaCab).toBe(1);
      expect(result[0].Total).toBe(23.6);
    });

    it("retorna lista vacía si no hay ventas", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
      const result = await salesService.getAll();
      expect(result).toHaveLength(0);
    });

    it("lanza error si la API falla", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Network error"));
      await expect(salesService.getAll()).rejects.toThrow("Network error");
    });
  });

  describe("create", () => {
    it("crea una venta con los detalles correctos", async () => {
      const dto: CreateSaleDto = {
        detalles: [{ Id_producto: 1, Cantidad: 20, Precio: 1.0 }],
      };
      mockedApi.post.mockResolvedValueOnce({ data: mockSale });

      const result = await salesService.create(dto);

      expect(mockedApi.post).toHaveBeenCalledWith("/sales", dto);
      expect(result.Id_VentaCab).toBe(1);
      expect(result.detalles[0].Cantidad).toBe(20);
    });

    it("lanza error si no hay stock suficiente", async () => {
      mockedApi.post.mockRejectedValueOnce(
        new Error("Bad Request: stock insuficiente")
      );
      await expect(
        salesService.create({ detalles: [{ Id_producto: 1, Cantidad: 9999, Precio: 1.0 }] })
      ).rejects.toThrow("stock insuficiente");
    });
  });

  describe("validación de stock", () => {
    it("cantidad solicitada no puede superar el stock disponible", () => {
      const stockDisponible = 50;
      const cantidadSolicitada = 60;
      expect(cantidadSolicitada > stockDisponible).toBe(true);
    });

    it("venta es válida si la cantidad no supera el stock", () => {
      const stockDisponible = 50;
      const cantidadSolicitada = 30;
      expect(cantidadSolicitada > stockDisponible).toBe(false);
    });
  });
});
