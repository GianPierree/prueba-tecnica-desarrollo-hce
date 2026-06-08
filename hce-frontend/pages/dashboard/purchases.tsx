import { useState, useEffect, useCallback } from "react";
import { Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Divider, addToast } from "@heroui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProductModal from "@/components/purchases/ProductModal";
import { productsService } from "@/lib/services/products.service";
import { purchasesService } from "@/lib/services/purchases.service";
import { Product } from "@/types/product.types";
import { formatCurrency, calculateTotals } from "@/lib/utils/formatters";

interface Line { producto_id:string; nombre_producto:string; cantidad:number; costo_unitario:number; subtotal:number; }

export default function PurchasesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proveedor, setProveedor] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [selId, setSelId] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  const load = useCallback(async () => setProducts(await productsService.getAll()), []);
  useEffect(() => { load(); }, [load]);

  const onSelectProduct = (id: string) => {
    setSelId(id);
    const p = products.find(x => x.id === id);
    if (p) setCost(String(p.costo));
  };

  const addLine = () => {
    if (!selId || !qty || !cost) { addToast({ title:"Seleccione producto, cantidad y costo", color:"warning" }); return; }
    const q = parseFloat(qty), c = parseFloat(cost);
    if (q<=0||c<=0) { addToast({ title:"Valores deben ser mayores a 0", color:"warning" }); return; }
    const p = products.find(x=>x.id===selId)!;
    setLines(prev => [...prev, { producto_id:selId, nombre_producto:p.nombre, cantidad:q, costo_unitario:c, subtotal:q*c }]);
    setSelId(""); setQty(""); setCost("");
  };

  const subtotal = lines.reduce((s,l)=>s+l.subtotal,0);
  const { igv, total } = calculateTotals(subtotal);

  const submit = async () => {
    if (!proveedor) { addToast({ title:"Ingrese el proveedor", color:"warning" }); return; }
    if (!lines.length) { addToast({ title:"Agregue al menos un producto", color:"warning" }); return; }
    setLoading(true);
    try {
      await purchasesService.create({ proveedor, fecha, detalles: lines.map(l=>({ producto_id:l.producto_id, cantidad:l.cantidad, costo_unitario:l.costo_unitario })) });
      addToast({ title:"Compra registrada correctamente", color:"success" });
      setProveedor(""); setFecha(new Date().toISOString().split("T")[0]); setLines([]); load();
    } catch(e:unknown) { addToast({ title: e instanceof Error ? e.message : "Error", color:"danger" }); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Registrar Compra</h1><p className="text-gray-500 text-sm mt-1">Ingrese los datos de la orden de compra</p></div>
        <Button color="secondary" variant="flat" onPress={()=>setIsProductModalOpen(true)}>+ Nuevo Producto</Button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Proveedor *" placeholder="Nombre del proveedor" value={proveedor} onChange={e=>setProveedor(e.target.value)} />
          <Input label="Fecha *" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
        </div>
        <Divider />
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Agregar Producto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <Select label="Producto *" placeholder="Seleccionar..." selectedKeys={selId?[selId]:[]} onSelectionChange={k=>onSelectProduct(Array.from(k)[0] as string)}>
              {products.map(p=><SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
            </Select>
            <Input label="Cantidad *" type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} />
            <Input label="Costo Unit. (S/) *" type="number" min="0" step="0.01" value={cost} onChange={e=>setCost(e.target.value)} />
            <Button color="primary" onPress={addLine}>Agregar</Button>
          </div>
        </div>
        {lines.length > 0 && <>
          <Divider />
          <Table aria-label="Detalle compra" removeWrapper>
            <TableHeader>
              <TableColumn>PRODUCTO</TableColumn><TableColumn className="text-right">CANT.</TableColumn>
              <TableColumn className="text-right">COSTO UNIT.</TableColumn><TableColumn className="text-right">SUBTOTAL</TableColumn><TableColumn> </TableColumn>
            </TableHeader>
            <TableBody>
              {lines.map((l,i)=>(
                <TableRow key={i}>
                  <TableCell>{l.nombre_producto}</TableCell><TableCell className="text-right">{l.cantidad}</TableCell>
                  <TableCell className="text-right">{formatCurrency(l.costo_unitario)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(l.subtotal)}</TableCell>
                  <TableCell><button onClick={()=>setLines(p=>p.filter((_,j)=>j!==i))} className="text-red-500 hover:text-red-700 text-sm">Quitar</button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>IGV (18%):</span><span>{formatCurrency(igv)}</span></div>
              <Divider />
              <div className="flex justify-between font-bold text-base"><span>Total:</span><span>{formatCurrency(total)}</span></div>
            </div>
          </div>
          <div className="flex justify-end"><Button color="primary" size="lg" onPress={submit} isLoading={loading}>Registrar Compra</Button></div>
        </>}
      </div>
      <ProductModal isOpen={isProductModalOpen} onClose={()=>setIsProductModalOpen(false)} onSuccess={load} />
    </DashboardLayout>
  );
}
