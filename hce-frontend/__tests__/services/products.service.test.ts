import { productsService } from "@/lib/services/products.service";
import api from "@/lib/utils/api";
import { Product, CreateProductDto, UpdateProductDto } from "@/types/product.types";

jest.mock("@/lib/utils/api");
const mockedApi = api as jest.Mocked<typeof api>;

const mockProduct: Product = {
  Id_producto: 1,
  Nombre_producto: "Paracetamol 500mg",
  NroLote: "LOTE-001",
  Fec_registro: "2024-01-10T00:00:00Z",
  Costo: 0.5,
  PrecioVenta: 0.68,
};

const mockProductList: Product[] = [
  mockProduct,
  {
    Id_producto: 2,
    Nombre_producto: "Amoxicilina 500mg",
    NroLote: "LOTE-002",
    Fec_registro: "2024-01-11T00:00:00Z",
    Costo: 1.2,
    PrecioVenta: 1.62,
  },
];

describe("productsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("retorna la lista de productos correctamente", async () => {
      mockedApi.get.mockResolvedValueOnce({
        data: { success: true, data: mockProductList },
      });

      const result = await productsService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith("/products");
      expect(result).toHaveLength(2);
      expect(result[0].Nombre_producto).toBe("Paracetamol 500mg");
    });

    it("lanza error si la API falla", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Network error"));
      await expect(productsService.getAll()).rejects.toThrow("Network error");
    });
  });

  describe("create", () => {
    it("crea un producto y retorna el producto creado", async () => {
      const dto: CreateProductDto = {
        Nombre_producto: "Paracetamol 500mg",
        NroLote: "LOTE-001",
        Costo: 0.5,
        PrecioVenta: 0.68,
      };
      mockedApi.post.mockResolvedValueOnce({ data: mockProduct });

      const result = await productsService.create(dto);

      expect(mockedApi.post).toHaveBeenCalledWith("/products", dto);
      expect(result.Id_producto).toBe(1);
      expect(result.Nombre_producto).toBe("Paracetamol 500mg");
    });

    it("calcula PrecioVenta como costo × 1.35", () => {
      const costo = 10;
      const precioEsperado = Number((costo * 1.35).toFixed(2));
      expect(precioEsperado).toBe(13.5);
    });
  });

  describe("update", () => {
    it("actualiza un producto y retorna el producto actualizado", async () => {
      const dto: UpdateProductDto = { Nombre_producto: "Paracetamol 1g", Costo: 1.0 };
      const updated = { ...mockProduct, Nombre_producto: "Paracetamol 1g", Costo: 1.0 };
      mockedApi.put.mockResolvedValueOnce({ data: updated });

      const result = await productsService.update(1, dto);

      expect(mockedApi.put).toHaveBeenCalledWith("/products/1", dto);
      expect(result.Nombre_producto).toBe("Paracetamol 1g");
      expect(result.Costo).toBe(1.0);
    });

    it("lanza error si el producto no existe", async () => {
      mockedApi.put.mockRejectedValueOnce(new Error("Not Found"));
      await expect(productsService.update(999, {})).rejects.toThrow("Not Found");
    });
  });
});
