import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@heroui/react";
import { KardexMovement } from "@/types/kardex.types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

interface Props { isOpen: boolean; onClose: () => void; productName: string; movements: KardexMovement[]; }

export default function MovementsModal({ isOpen, onClose, productName, movements }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <div><p className="text-lg font-semibold">Movimientos del Kardex</p><p className="text-sm text-gray-500 font-normal">{productName}</p></div>
        </ModalHeader>
        <ModalBody>
          {movements.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No hay movimientos registrados.</div>
          ) : (
            <Table aria-label={`Movimientos de ${productName}`} removeWrapper>
              <TableHeader>
                <TableColumn>FECHA</TableColumn>
                <TableColumn>TIPO</TableColumn>
                <TableColumn>REFERENCIA</TableColumn>
                <TableColumn className="text-right">CANTIDAD</TableColumn>
                <TableColumn className="text-right">COSTO UNIT.</TableColumn>
                <TableColumn className="text-right">STOCK ANT.</TableColumn>
                <TableColumn className="text-right">STOCK ACT.</TableColumn>
              </TableHeader>
              <TableBody>
                {movements.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDate(m.fecha)}</TableCell>
                    <TableCell>
                      <Chip color={m.tipo===1?"success":"danger"} variant="flat" size="sm">
                        {m.tipo_label}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-gray-600">{m.referencia}</TableCell>
                    <TableCell className="text-right">{m.cantidad}</TableCell>
                    <TableCell className="text-right">{formatCurrency(m.costo_unitario)}</TableCell>
                    <TableCell className="text-right">{m.stock_anterior}</TableCell>
                    <TableCell className="text-right font-medium">{m.stock_actual}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter><Button color="primary" onPress={onClose}>Cerrar</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
