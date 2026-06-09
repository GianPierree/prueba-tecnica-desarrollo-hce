import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  addToast,
} from "@heroui/react";
import { productsService } from "@/lib/services/products.service";
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from "@/types/product.types";
import { formatCurrency } from "@/lib/utils/formatters";

const PRECIO_VENTA_FACTOR = 1.35;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product?: Product) => void;
  productToEdit?: Product | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
}: Props) {
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

  const costoNum = parseFloat(form.Costo);
  const precioVentaCalculado =
    form.Costo && !isNaN(costoNum) && costoNum > 0
      ? Number((costoNum * PRECIO_VENTA_FACTOR).toFixed(2))
      : null;

  const handleSubmit = async () => {
    if (!form.Nombre_producto.trim() || !form.NroLote.trim() || !form.Costo) {
      addToast({ title: "Complete todos los campos obligatorios", color: "warning" });
      return;
    }
    if (isNaN(costoNum) || costoNum <= 0) {
      addToast({ title: "El costo debe ser un número mayor a 0", color: "warning" });
      return;
    }

    setLoading(true);
    try {
      let result: Product;

      if (isEdit && productToEdit) {
        const dto: UpdateProductDto = {
          Nombre_producto: form.Nombre_producto.trim(),
          NroLote: form.NroLote.trim(),
          Costo: costoNum,
          ...(precioVentaCalculado !== null && {
            PrecioVenta: precioVentaCalculado,
          }),
        };
        result = await productsService.update(productToEdit.Id_producto, dto);
        addToast({ title: "Producto actualizado", color: "success" });
      } else {
        const dto: CreateProductDto = {
          Nombre_producto: form.Nombre_producto.trim(),
          NroLote: form.NroLote.trim(),
          Costo: costoNum,
          PrecioVenta: precioVentaCalculado!,
        };
        result = await productsService.create(dto);
        addToast({ title: "Producto creado", color: "success" });
      }

      onSuccess(result);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </ModalHeader>

        <ModalBody className="gap-4">
          <Input
            label="Nombre del producto *"
            placeholder="Ej: Paracetamol 500mg"
            value={form.Nombre_producto}
            onChange={(e) => set("Nombre_producto", e.target.value)}
          />

          <Input
            label="Número de lote *"
            placeholder="Ej: LOTE-001"
            value={form.NroLote}
            onChange={(e) => set("NroLote", e.target.value)}
          />

          <Input
            label="Costo unitario (S/) *"
            type="number"
            min="0.01"
            step="0.01"
            value={form.Costo}
            onChange={(e) => set("Costo", e.target.value)}
          />

          {precioVentaCalculado !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">
                  Precio de venta calculado:
                </span>
                <span className="text-blue-900 font-bold text-base">
                  {formatCurrency(precioVentaCalculado)}
                </span>
              </div>
              <p className="text-blue-500 text-xs mt-1">
                Calculado automáticamente: Costo × {PRECIO_VENTA_FACTOR} ={" "}
                {formatCurrency(costoNum)} × {PRECIO_VENTA_FACTOR} ={" "}
                {formatCurrency(precioVentaCalculado)}
              </p>
            </div>
          )}

          {isEdit && productToEdit && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
              Precio de venta actual:{" "}
              <span className="font-medium text-gray-700">
                {formatCurrency(productToEdit.PrecioVenta)}
              </span>
              {precioVentaCalculado !== null &&
                precioVentaCalculado !== productToEdit.PrecioVenta && (
                  <span className="text-orange-600 ml-2">
                    → se actualizará a{" "}
                    <span className="font-medium">
                      {formatCurrency(precioVentaCalculado)}
                    </span>
                  </span>
                )}
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
