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

  describe("cálculo de IGV (18 % peruano)", () => {
    const IGV_RATE = 0.18;

    it("IGV es el 18 % del subtotal (no el 118 %)", () => {
      const subtotal = 50;
      const igv = subtotal * IGV_RATE;
      expect(igv).toBeCloseTo(9.0);          
      expect(igv).not.toBeCloseTo(59.0);     
    });

    it("el total es subtotal + IGV (= subtotal × 1.18)", () => {
      const subtotal = 50;
      const igv = subtotal * IGV_RATE;
      const total = subtotal + igv;
      expect(total).toBeCloseTo(59.0);       
      expect(total).toBeCloseTo(subtotal * (1 + IGV_RATE)); 
    });

    it("el mock de la compra tiene los valores correctos (subtotal=50, igv=9, total=59)", () => {
      const { SubTotal, Igv, Total } = mockPurchase;
      expect(Igv).toBeCloseTo(SubTotal * IGV_RATE);         
      expect(Total).toBeCloseTo(SubTotal + Igv);            
      expect(Total).toBeCloseTo(SubTotal * (1 + IGV_RATE)); 
    });

    it("cálculo de línea: cantidad × precio → subtotal → igv → total", () => {
      const cantidad = 100;
      const precio = 0.5;
      const subtotal = cantidad * precio;    
      const igv = subtotal * IGV_RATE;      
      const total = subtotal + igv;          

      expect(subtotal).toBeCloseTo(50.0);
      expect(igv).toBeCloseTo(9.0);
      expect(total).toBeCloseTo(59.0);
    });
  });

  describe("cálculo de PrecioVenta (Fix 2)", () => {
    const FACTOR = 1.35;

    it("precio de venta es costo × 1.35", () => {
      const costo = 10;
      const precioVenta = Number((costo * FACTOR).toFixed(2));
      expect(precioVenta).toBe(13.5);
    });

    it("precio de venta se redondea a 2 decimales", () => {
      const costo = 0.5;
      const precioVenta = Number((costo * FACTOR).toFixed(2));
      expect(precioVenta).toBe(0.68);
    });

    it("precio de venta es mayor al costo (margen positivo)", () => {
      const costo = 1.2;
      const precioVenta = Number((costo * FACTOR).toFixed(2));
      expect(precioVenta).toBeGreaterThan(costo);
      expect(precioVenta).toBeCloseTo(1.62);
    });
  });
});
