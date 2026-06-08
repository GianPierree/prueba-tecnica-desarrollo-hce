import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, addToast } from "@heroui/react";
import { productsService } from "@/lib/services/products.service";
import { Product, CreateProductDto, UpdateProductDto } from "@/types/product.types";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; productToEdit?: Product | null; }

export default function ProductModal({ isOpen, onClose, onSuccess, productToEdit }: Props) {
  const isEdit = !!productToEdit;
  const [form, setForm] = useState({ codigo:"", nombre:"", descripcion:"", costo:"", categoria:"", unidad_medida:"" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) setForm({ codigo:productToEdit.codigo, nombre:productToEdit.nombre, descripcion:productToEdit.descripcion??"", costo:String(productToEdit.costo), categoria:productToEdit.categoria, unidad_medida:productToEdit.unidad_medida });
    else setForm({ codigo:"", nombre:"", descripcion:"", costo:"", categoria:"", unidad_medida:"" });
  }, [productToEdit, isOpen]);

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    if (!form.codigo || !form.nombre || !form.costo || !form.categoria || !form.unidad_medida) { addToast({ title:"Complete todos los campos obligatorios", color:"warning" }); return; }
    const costo = parseFloat(form.costo);
    if (isNaN(costo) || costo <= 0) { addToast({ title:"El costo debe ser un número positivo", color:"warning" }); return; }
    setLoading(true);
    try {
      if (isEdit && productToEdit) {
        await productsService.update({ id:productToEdit.id, ...form, costo } as UpdateProductDto);
        addToast({ title:"Producto actualizado", color:"success" });
      } else {
        await productsService.create({ ...form, costo } as CreateProductDto);
        addToast({ title:"Producto creado", color:"success" });
      }
      onSuccess(); onClose();
    } catch (e: unknown) {
      addToast({ title: e instanceof Error ? e.message : "Error al guardar", color:"danger" });
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>{isEdit ? "Editar Producto" : "Nuevo Producto"}</ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Código *" placeholder="MED-001" value={form.codigo} onChange={e => set("codigo", e.target.value)} />
            <Input label="Nombre *" placeholder="Nombre del producto" value={form.nombre} onChange={e => set("nombre", e.target.value)} />
          </div>
          <Input label="Descripción" placeholder="Descripción opcional" value={form.descripcion} onChange={e => set("descripcion", e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Costo (S/) *" type="number" min="0" step="0.01" value={form.costo} onChange={e => set("costo", e.target.value)} />
            <Input label="Categoría *" placeholder="Medicamentos" value={form.categoria} onChange={e => set("categoria", e.target.value)} />
          </div>
          <Input label="Unidad de medida *" placeholder="Tableta, Cápsula..." value={form.unidad_medida} onChange={e => set("unidad_medida", e.target.value)} />
          {form.costo && !isNaN(parseFloat(form.costo)) && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              Precio de venta (costo × 1.35): <strong>S/ {(parseFloat(form.costo) * 1.35).toFixed(2)}</strong>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>Cancelar</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>{isEdit ? "Guardar cambios" : "Crear producto"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
