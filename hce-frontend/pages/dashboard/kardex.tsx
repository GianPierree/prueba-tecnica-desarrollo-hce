import { useState, useEffect, useCallback } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip } from "@heroui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MovementsModal from "@/components/kardex/MovementsModal";
import { kardexService } from "@/lib/services/kardex.service";
import { KardexEntry, KardexMovement } from "@/types/kardex.types";
import { formatCurrency } from "@/lib/utils/formatters";

export default function KardexPage() {
  const [kardex, setKardex] = useState<KardexEntry[]>([]);
  const [selected, setSelected] = useState<KardexEntry|null>(null);
  const [movements, setMovements] = useState<KardexMovement[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => setKardex(await kardexService.getAll()), []);
  useEffect(() => { load(); }, [load]);

  const view = async (entry: KardexEntry) => {
    setSelected(entry);
    setMovements(await kardexService.getMovementsByProduct(entry.producto_id));
    setOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Kardex</h1><p className="text-gray-500 text-sm mt-1">Control de inventario y movimientos de entrada/salida</p></div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table aria-label="Kardex" removeWrapper>
          <TableHeader>
            <TableColumn>CÓDIGO</TableColumn><TableColumn>PRODUCTO</TableColumn>
            <TableColumn className="text-right">ENTRADAS</TableColumn><TableColumn className="text-right">SALIDAS</TableColumn>
            <TableColumn className="text-right">STOCK</TableColumn><TableColumn className="text-right">COSTO PROM.</TableColumn>
            <TableColumn className="text-right">VALOR INV.</TableColumn><TableColumn> </TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay productos">
            {kardex.map(e=>(
              <TableRow key={e.producto_id}>
                <TableCell><code className="text-xs bg-gray-100 px-2 py-1 rounded">{e.codigo_producto}</code></TableCell>
                <TableCell className="font-medium">{e.nombre_producto}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">+{e.total_entradas}</TableCell>
                <TableCell className="text-right text-red-600 font-medium">-{e.total_salidas}</TableCell>
                <TableCell className="text-right">
                  <Chip color={e.stock_actual===0?"danger":e.stock_actual<10?"warning":"success"} variant="flat" size="sm">{e.stock_actual}</Chip>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(e.costo_promedio)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(e.valor_inventario)}</TableCell>
                <TableCell><Button size="sm" variant="flat" color="primary" onPress={()=>view(e)}>Ver movimientos</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <MovementsModal isOpen={open} onClose={()=>{setOpen(false);setSelected(null);setMovements([]);}} productName={selected?.nombre_producto??""} movements={movements} />
    </DashboardLayout>
  );
}
