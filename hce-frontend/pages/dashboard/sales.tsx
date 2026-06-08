import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Divider, 
  addToast,
} from "@heroui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { productsService } from "@/lib/services/products.service";
import { salesService } from "@/lib/services/sales.service";
import { kardexService } from "@/lib/services/kardex.service";
import { Product } from "@/types/product.types";
import { formatCurrency } from "@/lib/utils/formatters";

const TAX_RATE = 0.18;

interface Line {
  Id_producto: number;
  nombre: string;
  stock_disp: number;
  Cantidad: number;
  Precio: number;
  subtotal: number;
  igv: number;
  total: number;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [selId, setSelId] = useState<number | null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [stockDisp, setStockDisp] = useState<number | null>(null);
  const [lines, setLines] = useState<Line[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [prods, kardex] = await Promise.all([
        productsService.getAll(),
        kardexService.getAll(),
      ]);
      setProducts(prods);
      const map: Record<number, number> = {};
      kardex.forEach((k) => { map[k.Id_producto] = k.StockActual; });
      setStockMap(map);
    } catch {
      addToast({ title: "Error al cargar datos", color: "danger" });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onSelectProduct = (id: number) => {
    setSelId(id);
    const p = products.find((x) => x.Id_producto === id);
    if (p) setPrice(String(p.PrecioVenta));
    setStockDisp(stockMap[id] ?? 0);
  };

  const addLine = () => {
    if (!selId || !qty || !price) {
      addToast({ title: "Complete todos los campos", color: "warning" });
      return;
    }
    const q = parseFloat(qty);
    const pr = parseFloat(price);
    if (q <= 0 || pr <= 0) {
      addToast({ title: "Valores deben ser mayores a 0", color: "warning" });
      return;
    }
    if (stockDisp !== null && q > stockDisp) {
      addToast({
        title: `Stock insuficiente. Disponible: ${stockDisp}`,
        color: "danger",
      });
      return;
    }
    const subtotal = q * pr;
    const igv = subtotal * TAX_RATE;
    const total = subtotal + igv;
    const p = products.find((x) => x.Id_producto === selId)!;
    setLines((prev) => [
      ...prev,
      {
        Id_producto: selId,
        nombre: p.Nombre_producto,
        stock_disp: stockDisp ?? 0,
        Cantidad: q,
        Precio: pr,
        subtotal,
        igv,
        total,
      },
    ]);
    setSelId(null);
    setQty("");
    setPrice("");
    setStockDisp(null);
  };

  const grandSubtotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const grandIgv = lines.reduce((s, l) => s + l.igv, 0);
  const grandTotal = lines.reduce((s, l) => s + l.total, 0);

  const handleSubmit = async () => {
    if (!lines.length) {
      addToast({ title: "Agregue al menos un producto", color: "warning" });
      return;
    }
    setLoading(true);
    try {
      await salesService.create({
        detalles: lines.map((l) => ({
          Id_producto: l.Id_producto,
          Cantidad: l.Cantidad,
          Precio: l.Precio,
        })),
      });
      addToast({ title: "Venta registrada correctamente", color: "success" });
      setLines([]);
      loadData();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al registrar venta";
      addToast({ title: msg, color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registrar Venta</h1>
        <p className="text-gray-500 text-sm mt-1">Stock validado desde movimientos en tiempo real</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Agregar Producto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <Select
                label="Producto *"
                placeholder="Seleccionar..."
                selectedKeys={selId ? [String(selId)] : []}
                onSelectionChange={(k) => onSelectProduct(Number(Array.from(k)[0]))}
              >
                {products.map((p) => (
                  <SelectItem key={p.Id_producto}>
                    {p.Nombre_producto}
                  </SelectItem>
                ))}
              </Select>
              {stockDisp !== null && (
                <p className="text-xs mt-1 text-gray-500">
                  Stock disponible:{" "}
                  <span className={stockDisp > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {stockDisp}
                  </span>
                </p>
              )}
            </div>
            <Input
              label="Cantidad *"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <Input
              label="Precio Unit. (S/) *"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Button color="primary" onPress={addLine}>Agregar</Button>
          </div>
        </div>

        {lines.length > 0 && (
          <>
            <Divider />
            <Table aria-label="Detalle de venta" removeWrapper>
              <TableHeader>
                <TableColumn>PRODUCTO</TableColumn>
                <TableColumn className="text-right">STOCK</TableColumn>
                <TableColumn className="text-right">CANT.</TableColumn>
                <TableColumn className="text-right">PRECIO</TableColumn>
                <TableColumn className="text-right">SUBTOTAL</TableColumn>
                <TableColumn className="text-right">IGV</TableColumn>
                <TableColumn className="text-right">TOTAL</TableColumn>
                <TableColumn> </TableColumn>
              </TableHeader>
              <TableBody>
                {lines.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell>{l.nombre}</TableCell>
                    <TableCell className="text-right">
                      <Chip size="sm" color={l.stock_disp > 0 ? "success" : "danger"} variant="flat">
                        {l.stock_disp}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-right">{l.Cantidad}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.Precio)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.subtotal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.igv)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(l.total)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => setLines((p) => p.filter((_, j) => j !== i))}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Quitar
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span><span>{formatCurrency(grandSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>IGV (18%):</span><span>{formatCurrency(grandIgv)}</span>
                </div>
                <Divider />
                <div className="flex justify-between font-bold text-base">
                  <span>Total:</span><span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button color="success" size="lg" className="text-white" onPress={handleSubmit} isLoading={loading}>
                Registrar Venta
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
