import { useState, useEffect, useCallback } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, addToast,
} from "@heroui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductModal from "@/components/purchases/ProductModal";
import { productsService } from "@/lib/services/products.service";
import { Product } from "@/types/product.types";
import { formatCurrency } from "@/lib/utils/formatters";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [toEdit, setToEdit] = useState<Product | null>(null);

  const load = useCallback(async () => {
    try {
      const products = await productsService.getAll()
      setProducts(products);
    } catch {
      addToast({ title: "Error al cargar productos", color: "danger" });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Catálogo de productos y control de precios</p>
        </div>
        <Button color="primary" onPress={() => { setToEdit(null); setOpen(true); }}>
          + Nuevo Producto
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table aria-label="Productos" removeWrapper>
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>NRO. LOTE</TableColumn>
            <TableColumn>FECHA REGISTRO</TableColumn>
            <TableColumn className="text-right">COSTO</TableColumn>
            <TableColumn className="text-right">PRECIO VENTA</TableColumn>
            <TableColumn> </TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay productos registrados">
            {products.map((p) => (
              <TableRow key={p.Id_producto}>
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{p.Id_producto}</code>
                </TableCell>
                <TableCell className="font-medium">{p.Nombre_producto}</TableCell>
                <TableCell>{p.NroLote}</TableCell>
                <TableCell>
                  {new Date(p.Fec_registro).toLocaleDateString("es-PE")}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(p.Costo)}</TableCell>
                <TableCell className="text-right font-medium text-blue-700">
                  {formatCurrency(p.PrecioVenta)}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="flat"
                    color="warning"
                    onPress={() => { setToEdit(p); setOpen(true); }}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductModal
        isOpen={open}
        onClose={() => { setOpen(false); setToEdit(null); }}
        onSuccess={load}
        productToEdit={toEdit}
      />
    </DashboardLayout>
  );
}
