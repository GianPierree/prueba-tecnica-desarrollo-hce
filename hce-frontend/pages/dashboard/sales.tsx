import { useState, useEffect, useCallback } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  addToast,
} from "@heroui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SaleModal from "@/components/sales/SaleModal";
import { salesService } from "@/lib/services/sales.service";
import { Sale } from "@/types/sale.types";
import { formatCurrency } from "@/lib/utils/formatters";

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("es-PE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<Sale | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSales(await salesService.getAll());
    } catch {
      addToast({ title: "Error al cargar ventas", color: "danger" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500 text-sm mt-1">Historial de ventas registradas</p>
        </div>
        <Button color="success" className="text-white" onPress={() => setNewOpen(true)}>
          + Nueva Venta
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table aria-label="Lista de ventas" removeWrapper>
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>FECHA</TableColumn>
            <TableColumn className="text-right">SUBTOTAL</TableColumn>
            <TableColumn className="text-right">IGV</TableColumn>
            <TableColumn className="text-right">TOTAL</TableColumn>
            <TableColumn>PRODUCTOS</TableColumn>
            <TableColumn> </TableColumn>
          </TableHeader>
          <TableBody emptyContent={loading ? "Cargando..." : "No hay ventas registradas"}>
            {sales.map((s) => (
              <TableRow key={s.Id_VentaCab}>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    VENT-{String(s.Id_VentaCab).padStart(3, "0")}
                  </code>
                </TableCell>
                <TableCell>{formatDate(s.fecRegistro)}</TableCell>
                <TableCell className="text-right">{formatCurrency(s.SubTotal)}</TableCell>
                <TableCell className="text-right">{formatCurrency(s.Igv)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(s.Total)}</TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color="success">
                    {s.detalles?.length ?? 0} ítem(s)
                  </Chip>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="flat" onPress={() => setSelected(s)}>
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal nueva venta */}
      <SaleModal
        isOpen={newOpen}
        onClose={() => setNewOpen(false)}
        onSuccess={load}
      />

      {/* Modal detalle */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div>
              <p className="text-lg font-semibold">Detalle de Venta</p>
              {selected && (
                <p className="text-sm text-gray-500 font-normal">
                  VENT-{String(selected.Id_VentaCab).padStart(3, "0")} — {formatDate(selected.fecRegistro)}
                </p>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            {selected && (
              <>
                <Table aria-label="Detalle venta" removeWrapper>
                  <TableHeader>
                    <TableColumn>ID PRODUCTO</TableColumn>
                    <TableColumn className="text-right">CANT.</TableColumn>
                    <TableColumn className="text-right">PRECIO</TableColumn>
                    <TableColumn className="text-right">SUBTOTAL</TableColumn>
                    <TableColumn className="text-right">IGV</TableColumn>
                    <TableColumn className="text-right">TOTAL</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(selected.detalles ?? []).map((d) => (
                      <TableRow key={d.Id_VentaDet}>
                        <TableCell>{d.Id_producto}</TableCell>
                        <TableCell className="text-right">{d.Cantidad}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.Precio)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.Sub_Total)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.Igv)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(d.Total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end mt-4">
                  <div className="w-56 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span><span>{formatCurrency(selected.SubTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>IGV:</span><span>{formatCurrency(selected.Igv)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total:</span><span>{formatCurrency(selected.Total)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setSelected(null)}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
