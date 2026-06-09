import { 
  useState, 
  useEffect, 
  useCallback 
} from "react";
import {
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Table, 
  TableHeader,
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Divider, 
  addToast,
} from "@heroui/react";
import { productsService } from "@/lib/services/products.service";
import { purchasesService } from "@/lib/services/purchases.service";
import { Product } from "@/types/product.types";
import { formatCurrency } from "@/lib/utils/formatters";

const TAX_RATE = 0.18;

interface Line {
  Id_producto: number;
  nombre: string;
  Cantidad: number;
  Precio: number;
  subtotal: number;
  igv: number;
  total: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseModal({ isOpen, onClose, onSuccess }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selId, setSelId] = useState<number | null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  const loadProducts = useCallback(async () => {
    try {
      setProducts(await productsService.getAll());
    } catch {
      addToast({ title: "Error al cargar productos", color: "danger" });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      setLines([]);
      setSelId(null);
      setQty("");
      setPrice("");
    }
  }, [isOpen, loadProducts]);

  const onSelectProduct = (id: number) => {
    setSelId(id);
    const p = products.find((x) => x.Id_producto === id);
    if (p) setPrice(String(p.Costo));
  };

  const addLine = () => {
    if (!selId || !qty || !price) {
      addToast({ title: "Seleccione producto, cantidad y precio", color: "warning" });
      return;
    }
    const q = parseFloat(qty);
    const c = parseFloat(price);
    if (q <= 0 || c <= 0) {
      addToast({ title: "Valores deben ser mayores a 0", color: "warning" });
      return;
    }
    const subtotal = q * c;
    const igv = subtotal * TAX_RATE;
    const total = subtotal + igv;
    const p = products.find((x) => x.Id_producto === selId)!;
    setLines((prev) => [
      ...prev,
      { Id_producto: selId, nombre: p.Nombre_producto, Cantidad: q, Precio: c, subtotal, igv, total },
    ]);
    setSelId(null);
    setQty("");
    setPrice("");
  };

  const grandSubtotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const grandIgv     = lines.reduce((s, l) => s + l.igv, 0);
  const grandTotal   = lines.reduce((s, l) => s + l.total, 0);

  const handleSubmit = async () => {
    if (!lines.length) {
      addToast({ title: "Agregue al menos un producto", color: "warning" });
      return;
    }
    setLoading(true);
    try {
      await purchasesService.create({
        detalles: lines.map((l) => ({
          Id_producto: l.Id_producto,
          Cantidad: l.Cantidad,
          Precio: l.Precio,
        })),
      });
      addToast({ title: "Compra registrada correctamente", color: "success" });
      onSuccess();
      onClose();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al registrar compra";
      addToast({ title: msg, color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Nueva Compra</ModalHeader>
        <ModalBody className="gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Agregar Producto</p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <Select
                label="Producto *"
                placeholder="Seleccionar..."
                selectedKeys={selId ? [String(selId)] : []}
                onSelectionChange={(k) => onSelectProduct(Number(Array.from(k)[0]))}
              >
                {products.map((p) => (
                  <SelectItem key={p.Id_producto}>{p.Nombre_producto}</SelectItem>
                ))}
              </Select>
              <Input
                label="Cantidad *"
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
              <Input
                label="Costo Unit. (S/) *"
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
              <Table aria-label="Detalle de compra" removeWrapper>
                <TableHeader>
                  <TableColumn>PRODUCTO</TableColumn>
                  <TableColumn className="text-right">CANT.</TableColumn>
                  <TableColumn className="text-right">COSTO</TableColumn>
                  <TableColumn className="text-right">SUBTOTAL</TableColumn>
                  <TableColumn className="text-right">IGV</TableColumn>
                  <TableColumn className="text-right">TOTAL</TableColumn>
                  <TableColumn> </TableColumn>
                </TableHeader>
                <TableBody>
                  {lines.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell>{l.nombre}</TableCell>
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
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>Cancelar</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            Registrar Compra
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
