import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip
} from "@heroui/react";
import { KardexMovement } from "@/types/kardex.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  movements: KardexMovement[];
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("es-PE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function MovementsModal({ isOpen, onClose, productName, movements }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <div>
            <p className="text-lg font-semibold">Movimientos del Kardex</p>
            <p className="text-sm text-gray-500 font-normal">{productName}</p>
          </div>
        </ModalHeader>
        <ModalBody>
          {movements.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No hay movimientos registrados.</div>
          ) : (
            <Table aria-label={`Movimientos de ${productName}`} removeWrapper>
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
                      <Chip
                        color={m.TipoMovimiento === "Entrada" ? "success" : "danger"}
                        variant="flat"
                        size="sm"
                      >
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
          <Button color="primary" onPress={onClose}>Cerrar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}