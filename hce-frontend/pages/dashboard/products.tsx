import { useState, useEffect, useCallback } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip } from "@heroui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductModal from "@/components/purchases/ProductModal";
import { productsService } from "@/lib/services/products.service";
import { Product } from "@/types/product.types";
import { formatCurrency } from "@/lib/utils/formatters";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [toEdit, setToEdit] = useState<Product|null>(null);

  const load = useCallback(async () => setProducts(await productsService.getAll()), []);
  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Productos</h1><p className="text-gray-500 text-sm mt-1">Catálogo de productos y control de inventario</p></div>
        <Button color="primary" onPress={()=>{setToEdit(null);setOpen(true);}}>+ Nuevo Producto</Button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table aria-label="Productos" removeWrapper>
          <TableHeader>
            <TableColumn>CÓDIGO</TableColumn><TableColumn>NOMBRE</TableColumn><TableColumn>CATEGORÍA</TableColumn>
            <TableColumn>UNIDAD</TableColumn><TableColumn className="text-right">STOCK</TableColumn>
            <TableColumn className="text-right">COSTO</TableColumn><TableColumn className="text-right">PRECIO VENTA</TableColumn>
            <TableColumn>ESTADO</TableColumn><TableColumn> </TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay productos">
            {products.map(p=>(
              <TableRow key={p.id}>
                <TableCell><code className="text-xs bg-gray-100 px-2 py-1 rounded">{p.codigo}</code></TableCell>
                <TableCell><div><p className="font-medium">{p.nombre}</p>{p.descripcion&&<p className="text-xs text-gray-500">{p.descripcion}</p>}</div></TableCell>
                <TableCell>{p.categoria}</TableCell><TableCell>{p.unidad_medida}</TableCell>
                <TableCell className="text-right"><Chip size="sm" variant="flat" color={p.stock===0?"danger":p.stock<10?"warning":"success"}>{p.stock}</Chip></TableCell>
                <TableCell className="text-right">{formatCurrency(p.costo)}</TableCell>
                <TableCell className="text-right font-medium text-blue-700">{formatCurrency(p.precio_venta)}</TableCell>
                <TableCell><Chip size="sm" variant="flat" color={p.activo?"success":"default"}>{p.activo?"Activo":"Inactivo"}</Chip></TableCell>
                <TableCell><Button size="sm" variant="flat" color="warning" onPress={()=>{setToEdit(p);setOpen(true);}}>Editar</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ProductModal isOpen={open} onClose={()=>{setOpen(false);setToEdit(null);}} onSuccess={load} productToEdit={toEdit} />
    </DashboardLayout>
  );
}
