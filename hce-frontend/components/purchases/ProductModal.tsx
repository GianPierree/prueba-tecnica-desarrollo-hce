import { useState, useEffect } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, addToast,
} from "@heroui/react";
import { productsService } from "@/lib/services/products.service";
import { Product, CreateProductDto, UpdateProductDto } from "@/types/product.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
}

export default function ProductModal({ isOpen, onClose, onSuccess, productToEdit }: Props) {
  const isEdit = !!productToEdit;

  const [form, setForm] = useState({
    Nombre_producto: "",
    NroLote: "",
    Costo: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setForm({
        Nombre_producto: productToEdit.Nombre_producto,
        NroLote: productToEdit.NroLote,
        Costo: String(productToEdit.Costo),
      });
    } else {
      setForm({ Nombre_producto: "", NroLote: "", Costo: "" });
    }
  }, [productToEdit, isOpen]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.Nombre_producto || !form.NroLote || !form.Costo) {
      addToast({ title: "Complete todos los campos obligatorios", color: "warning" });
      return;
    }
    const costo = parseFloat(form.Costo);
    if (isNaN(costo) || costo <= 0) {
      addToast({ title: "El costo debe ser un número positivo", color: "warning" });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && productToEdit) {
        const dto: UpdateProductDto = {
          Nombre_producto: form.Nombre_producto,
          NroLote: form.NroLote,
          Costo: costo,
        };
        await productsService.update(productToEdit.Id_producto, dto);
        addToast({ title: "Producto actualizado", color: "success" });
      } else {
        const dto: CreateProductDto = {
          Nombre_producto: form.Nombre_producto,
          NroLote: form.NroLote,
          Costo: costo,
        };
        await productsService.create(dto);
        addToast({ title: "Producto creado", color: "success" });
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al guardar el producto";
      addToast({ title: msg, color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const precioVenta = form.Costo && !isNaN(parseFloat(form.Costo))
    ? (parseFloat(form.Costo) * 1.35).toFixed(2)
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>{isEdit ? "Editar Producto" : "Nuevo Producto"}</ModalHeader>
        <ModalBody className="gap-4">
          <Input
            label="Nombre del producto *"
            placeholder="Paracetamol 500mg"
            value={form.Nombre_producto}
            onChange={(e) => set("Nombre_producto", e.target.value)}
          />
          <Input
            label="Número de lote *"
            placeholder="LOTE-001"
            value={form.NroLote}
            onChange={(e) => set("NroLote", e.target.value)}
          />
          <Input
            label="Costo (S/) *"
            type="number"
            min="0"
            step="0.01"
            value={form.Costo}
            onChange={(e) => set("Costo", e.target.value)}
          />
          {precioVenta && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              Precio de venta calculado automáticamente (costo × 1.35):{" "}
              <strong>S/ {precioVenta}</strong>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Cancelar
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            {isEdit ? "Guardar cambios" : "Crear producto"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
