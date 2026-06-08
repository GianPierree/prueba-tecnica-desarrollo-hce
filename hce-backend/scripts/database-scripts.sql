-- ============================================================
-- HCE - Sistema de Compras y Ventas
-- Scripts de Base de Datos (SQL Server)
-- ============================================================

USE master;
GO

-- ─── INSERTAR ────────────────────────────────────────────────

-- Insertar producto manualmente (solo para pruebas; lo normal es via API)
INSERT INTO Products (Nombre_producto, NroLote, Fec_registro, Costo, PrecioVenta, StockActual)
VALUES
  ('Paracetamol 500mg',   'LOTE-001', GETDATE(), 10.00, 13.50, 0),
  ('Ibuprofeno 400mg',    'LOTE-002', GETDATE(), 8.50,  11.48, 0),
  ('Amoxicilina 500mg',   'LOTE-003', GETDATE(), 15.00, 20.25, 0),
  ('Omeprazol 20mg',      'LOTE-004', GETDATE(), 6.00,  8.10,  0),
  ('Metformina 850mg',    'LOTE-005', GETDATE(), 4.50,  6.08,  0);
GO

-- Insertar usuario de prueba (clave: 123456 — hash generado con bcrypt)
INSERT INTO [User] (NombreCompleto, Correo, Clave, Fec_registro)
VALUES ('Admin HCE', 'admin@hce.com',
  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zl4kI.5L9GDbFu3/dUWbi', -- "123456"
  GETDATE());
GO

-- ─── LISTAR ──────────────────────────────────────────────────

-- Listar todos los productos con stock
SELECT
  Id_producto,
  Nombre_producto,
  NroLote,
  FORMAT(Fec_registro, 'dd/MM/yyyy HH:mm') AS FechaRegistro,
  Costo,
  PrecioVenta,
  StockActual
FROM Products
ORDER BY Id_producto;
GO

-- Listar compras con cabecera + detalle
SELECT
  pc.Id_CompraCab,
  FORMAT(pc.FecRegistro, 'dd/MM/yyyy HH:mm') AS FechaCompra,
  p.Nombre_producto,
  pd.Cantidad,
  pd.Precio,
  pd.Sub_Total,
  pd.Igv,
  pd.Total,
  pc.Total AS TotalCompra
FROM PurchasesCab pc
INNER JOIN PurchasesDet pd ON pc.Id_CompraCab = pd.Id_CompraCab
INNER JOIN Products p      ON pd.Id_producto  = p.Id_producto
ORDER BY pc.FecRegistro DESC;
GO

-- Listar ventas con cabecera + detalle
SELECT
  vc.Id_VentaCab,
  FORMAT(vc.fecRegistro, 'dd/MM/yyyy HH:mm') AS FechaVenta,
  p.Nombre_producto,
  vd.Cantidad,
  vd.Precio,
  vd.Sub_Total,
  vd.Igv,
  vd.Total,
  vc.Total AS TotalVenta
FROM SalesCab vc
INNER JOIN SalesDet vd ON vc.Id_VentaCab = vd.Id_VentaCab
INNER JOIN Products p  ON vd.Id_producto = p.Id_producto
ORDER BY vc.fecRegistro DESC;
GO

-- Vista Kardex: stock actual por producto con movimientos
SELECT
  p.Id_producto,
  p.Nombre_producto,
  p.StockActual    AS Stock_Actual,
  p.Costo,
  p.PrecioVenta,
  COUNT(md.Id_MovimientoDet) AS Total_Movimientos
FROM Products p
LEFT JOIN MovementsDet md ON p.Id_producto = md.Id_Producto
GROUP BY p.Id_producto, p.Nombre_producto, p.StockActual, p.Costo, p.PrecioVenta
ORDER BY p.Id_producto;
GO

-- Historial de movimientos de un producto específico
-- (reemplazar @productoId con el ID deseado)
DECLARE @productoId INT = 1;

SELECT
  mc.Id_MovimientoCab,
  FORMAT(mc.Fec_registro, 'dd/MM/yyyy HH:mm') AS FechaMovimiento,
  CASE mc.Id_TipoMovimiento
    WHEN 1 THEN 'Entrada (Compra)'
    WHEN 2 THEN 'Salida (Venta)'
    ELSE 'Desconocido'
  END AS TipoMovimiento,
  mc.Id_DocumentoOrigen,
  md.Cantidad
FROM MovementsCab mc
INNER JOIN MovementsDet md ON mc.Id_MovimientoCab = md.Id_movimientocab
WHERE md.Id_Producto = @productoId
ORDER BY mc.Fec_registro DESC;
GO

-- ─── ACTUALIZAR ───────────────────────────────────────────────

-- Actualizar precio de venta de un producto
UPDATE Products
SET PrecioVenta = Costo * 1.35
WHERE Id_producto = 1;
GO

-- Actualizar datos generales de un producto
UPDATE Products
SET
  Nombre_producto = 'Paracetamol 1000mg',
  NroLote         = 'LOTE-001-B'
WHERE Id_producto = 1;
GO

-- ─── ELIMINAR ────────────────────────────────────────────────

-- Eliminar producto (solo si no tiene movimientos asociados)
DELETE FROM Products
WHERE Id_producto = 99
  AND NOT EXISTS (
    SELECT 1 FROM MovementsDet WHERE Id_Producto = 99
  );
GO

-- Eliminar detalle de compra (con precaución)
DELETE FROM PurchasesDet
WHERE Id_CompraDet = 99;
GO

-- ─── CONSULTAS AVANZADAS ──────────────────────────────────────

-- Top 10 productos más vendidos (último trimestre)
SELECT TOP 10
  p.Id_producto,
  p.Nombre_producto,
  SUM(vd.Cantidad)   AS CantidadVendida,
  SUM(vd.Sub_Total)  AS TotalIngresos
FROM SalesDet vd
INNER JOIN Products p  ON vd.Id_producto  = p.Id_producto
INNER JOIN SalesCab vc ON vd.Id_VentaCab  = vc.Id_VentaCab
WHERE vc.fecRegistro >= DATEADD(MONTH, -3, GETDATE())
GROUP BY p.Id_producto, p.Nombre_producto
ORDER BY CantidadVendida DESC;
GO
