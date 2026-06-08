import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { kardexService } from "@/lib/services/kardex.service";
import { KardexEntry, KardexMovement } from "@/types/kardex.types";
import { formatCurrency } from "@/lib/utils/formatters";

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("es-PE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function KardexPage() {
  const [kardex, setKardex] = useState<KardexEntry[]>([]);
  const [movements, setMovements] = useState<KardexMovement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<KardexEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const loadKardex = useCallback(async () => {
    try {
      setKardex(await kardexService.getAll());
    } catch {
      addToast({ title: "Error al cargar kardex", color: "danger" });
    }
  }, []);

  useEffect(() => { loadKardex(); }, [loadKardex]);

  const handleViewMovements = async (entry: KardexEntry) => {
    setSelectedProduct(entry);
    setModalOpen(true);
    setLoadingMovements(true);
    try {
      setMovements(await kardexService.getMovementsByProduct(entry.Id_producto));
    } catch {
      addToast({ title: "Error al cargar movimientos", color: "danger" });
    } finally {
      setLoadingMovements(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setMovements([]);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kardex</h1>
        <p className="text-gray-500 text-sm mt-1">Control de inventario y movimientos de entrada/salida</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table aria-label="Kardex" removeWrapper>
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>PRODUCTO</TableColumn>
            <TableColumn className="text-right">STOCK ACTUAL</TableColumn>
            <TableColumn className="text-right">COSTO</TableColumn>
            <TableColumn className="text-right">PRECIO VENTA</TableColumn>
            <TableColumn> </TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay datos en el kardex">
            {kardex.map((e) => (
              <TableRow key={e.Id_producto}>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{e.Id_producto}</code>
                </TableCell>
                <TableCell className="font-medium">{e.Nombre_producto}</TableCell>
                <TableCell className="text-right">
                  <Chip
                    color={e.StockActual === 0 ? "danger" : e.StockActual < 10 ? "warning" : "success"}
                    variant="flat"
                    size="sm"
                  >
                    {e.StockActual}
                  </Chip>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(e.Costo)}</TableCell>
                <TableCell className="text-right font-medium text-blue-700">
                  {formatCurrency(e.PrecioVenta)}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="flat" color="primary" onPress={() => handleViewMovements(e)}>
                    Ver movimientos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={modalOpen} onClose={handleClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div>
              <p className="text-lg font-semibold">Movimientos del Producto</p>
              {selectedProduct && (
                <p className="text-sm text-gray-500 font-normal">{selectedProduct.Nombre_producto}</p>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            {loadingMovements ? (
              <div className="py-8 text-center text-gray-500">Cargando movimientos...</div>
            ) : movements.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No hay movimientos registrados.</div>
            ) : (
              <Table aria-label="Movimientos" removeWrapper>
                <TableHeader>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>TIPO</TableColumn>
                  <TableColumn className="text-right">CANTIDAD</TableColumn>
                </TableHeader>
                <TableBody>
                  {movements.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell>{formatDate(m.FechaRegistro)}</TableCell>
                      <TableCell>
                        <Chip color={m.TipoMovimiento === "Entrada" ? "success" : "danger"} variant="flat" size="sm">
                          {m.TipoMovimiento}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-right font-medium">{m.Cantidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={handleClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
