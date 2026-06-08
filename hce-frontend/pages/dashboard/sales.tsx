import { useState, useEffect, useCallback } from "react";
import { Button, Input, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Divider, Chip, addToast } from "@heroui/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { productsService } from "@/lib/services/products.service";
import { salesService } from "@/lib/services/sales.service";
import { kardexService } from "@/lib/services/kardex.service";
import { Product } from "@/types/product.types";
import { formatCurrency, calculateTotals } from "@/lib/utils/formatters";

interface Line { producto_id:string; nombre_producto:string; stock_disp:number; cantidad:number; precio_unitario:number; subtotal:number; }

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [selId, setSelId] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState<number|null>(null);
  const [lines, setLines] = useState<Line[]>([]);

  const load = useCallback(async () => setProducts(await productsService.getAll()), []);
  useEffect(() => { load(); }, [load]);

  const onSelectProduct = async (id: string) => {
    setSelId(id);
    const p = products.find(x=>x.id===id);
    if (p) { setPrice(String(p.precio_venta)); setStock(await kardexService.getStock(id)); }
  };

  const addLine = () => {
    if (!selId||!qty||!price) { addToast({ title:"Complete todos los campos", color:"warning" }); return; }
    const q=parseFloat(qty), pr=parseFloat(price);
    if (q<=0||pr<=0) { addToast({ title:"Valores deben ser mayores a 0", color:"warning" }); return; }
    if (stock!==null && q>stock) { addToast({ title:`Stock insuficiente. Disponible: ${stock}`, color:"danger" }); return; }
    const p=products.find(x=>x.id===selId)!;
    setLines(prev=>[...prev,{ producto_id:selId, nombre_producto:p.nombre, stock_disp:stock??0, cantidad:q, precio_unitario:pr, subtotal:q*pr }]);
    setSelId(""); setQty(""); setPrice(""); setStock(null);
  };

  const subtotal = lines.reduce((s,l)=>s+l.subtotal,0);
  const { igv, total } = calculateTotals(subtotal);

  const submit = async () => {
    if (!cliente) { addToast({ title:"Ingrese el nombre del cliente", color:"warning" }); return; }
    if (!lines.length) { addToast({ title:"Agregue al menos un producto", color:"warning" }); return; }
    setLoading(true);
    try {
      await salesService.create({ cliente, fecha, detalles: lines.map(l=>({ producto_id:l.producto_id, cantidad:l.cantidad, precio_unitario:l.precio_unitario })) });
      addToast({ title:"Venta registrada correctamente", color:"success" });
      setCliente(""); setFecha(new Date().toISOString().split("T")[0]); setLines([]); load();
    } catch(e:unknown) { addToast({ title: e instanceof Error ? e.message : "Error", color:"danger" }); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Registrar Venta</h1><p className="text-gray-500 text-sm mt-1">Stock validado en tiempo real</p></div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Cliente *" placeholder="Nombre del cliente" value={cliente} onChange={e=>setCliente(e.target.value)} />
          <Input label="Fecha *" type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
        </div>
        <Divider />
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Agregar Producto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <Select label="Producto *" placeholder="Seleccionar..." selectedKeys={selId?[selId]:[]} onSelectionChange={k=>onSelectProduct(Array.from(k)[0] as string)}>
                {products.map(p=><SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
              </Select>
              {stock!==null && <p className="text-xs mt-1 text-gray-500">Stock: <span className={stock>0?"text-green-600 font-medium":"text-red-600 font-medium"}>{stock}</span></p>}
            </div>
            <Input label="Cantidad *" type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} />
            <Input label="Precio Unit. (S/) *" type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} />
            <Button color="primary" onPress={addLine}>Agregar</Button>
          </div>
        </div>
        {lines.length > 0 && <>
          <Divider />
          <Table aria-label="Detalle venta" removeWrapper>
            <TableHeader>
              <TableColumn>PRODUCTO</TableColumn><TableColumn className="text-right">STOCK</TableColumn>
              <TableColumn className="text-right">CANT.</TableColumn><TableColumn className="text-right">PRECIO</TableColumn>
              <TableColumn className="text-right">SUBTOTAL</TableColumn><TableColumn> </TableColumn>
            </TableHeader>
            <TableBody>
              {lines.map((l,i)=>(
                <TableRow key={i}>
                  <TableCell>{l.nombre_producto}</TableCell>
                  <TableCell className="text-right"><Chip size="sm" color={l.stock_disp>0?"success":"danger"} variant="flat">{l.stock_disp}</Chip></TableCell>
                  <TableCell className="text-right">{l.cantidad}</TableCell>
                  <TableCell className="text-right">{formatCurrency(l.precio_unitario)}</TableCell>
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
          <div className="flex justify-end"><Button color="success" size="lg" className="text-white" onPress={submit} isLoading={loading}>Registrar Venta</Button></div>
        </>}
      </div>
    </DashboardLayout>
  );
}
