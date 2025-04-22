import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  productos,
  historialPrecios,
  inventarios,
  movimientosInventarios,
  catTipoMovimientos,
  ordenesDeVentas,
  detallesOrdenesDeVentas
} from "~/server/db/schema";
import { eq, lte, desc, and, sql, max } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// ID fijo para el usuario sistema
const SISTEMA_ID = "00000000-0000-0000-0000-000000000000";

export const posRouter = createTRPCRouter({
  // Buscar productos por nombre para el punto de venta
  searchProducts: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const { query } = input;
      
      // Subconsulta para obtener el último precio de cada producto
      const latestPriceSubquery = db
        .select({
          productosId: historialPrecios.productosId,
          latestId: max(historialPrecios.id),
        })
        .from(historialPrecios)
        .where(lte(historialPrecios.fechaDeRegistro, new Date()))
        .groupBy(historialPrecios.productosId)
        .as("latest_prices");

      const productosEncontrados = await db
        .select({
          id: productos.id,
          nombre: productos.nombre,
          precio: historialPrecios.precio,
        })
        .from(productos)
        .leftJoin(latestPriceSubquery, eq(productos.id, latestPriceSubquery.productosId))
        .leftJoin(historialPrecios, eq(latestPriceSubquery.latestId, historialPrecios.id))
        .where(sql`${productos.nombre} LIKE ${`%${query}%`}`)
        .orderBy(productos.nombre);

      return productosEncontrados;
    }),

  // Verificar inventario disponible
  checkInventory: publicProcedure
    .input(z.object({ 
      productoId: z.string().uuid(),
      cantidad: z.number().int().positive()
    }))
    .query(async ({ input }) => {
      const { productoId, cantidad } = input;
      
      // Obtener todas las ubicaciones donde está disponible el producto
      const inventarioDisponible = await db
        .select({
          id: inventarios.id,
          ubicacionesId: inventarios.ubicacionesId,
          cantidadDisponible: inventarios.cantidadDisponible
        })
        .from(inventarios)
        .where(eq(inventarios.productosId, productoId));
      
      // Calcular el total disponible sumando todas las ubicaciones
      const totalDisponible = inventarioDisponible.reduce(
        (total, item) => total + item.cantidadDisponible,
        0
      );
      
      return {
        disponible: totalDisponible >= cantidad,
        totalDisponible,
        detalleUbicaciones: inventarioDisponible
      };
    }),

  // Procesar una venta completa
  procesarVenta: publicProcedure
    .input(z.object({
      metodoPagoId: z.string().uuid(),
      personasId: z.string().uuid().optional(),
      productos: z.array(
        z.object({
          id: z.string().uuid(),
          cantidad: z.number().int().positive(),
          ubicacionId: z.string().uuid()
        })
      )
    }))
    .mutation(async ({ input, ctx }) => {
      const { metodoPagoId, personasId, productos: productosVenta } = input;
      const usuarioId = ctx.session?.user?.id || SISTEMA_ID;
      const fechaOrden = new Date();

      if (!personasId) {
        throw new Error("El ID del cliente es requerido para procesar la venta.");
      }
      
      try {
        return await db.transaction(async (trx) => {
          const ordenVentaId = uuidv4();
          
          // Obtener precios actuales para todos los productos
          const latestPriceSubquery = db
            .select({
              productosId: historialPrecios.productosId,
              latestId: max(historialPrecios.id),
            })
            .from(historialPrecios)
            .where(lte(historialPrecios.fechaDeRegistro, fechaOrden))
            .groupBy(historialPrecios.productosId)
            .as("latest_prices");

          // Obtener los precios actuales para cada producto
          const preciosActuales = await trx
            .select({
              productosId: productos.id,
              precio: historialPrecios.precio,
              historialPreciosId: historialPrecios.id
            })
            .from(productos)
            .innerJoin(latestPriceSubquery, eq(productos.id, latestPriceSubquery.productosId))
            .innerJoin(historialPrecios, eq(latestPriceSubquery.latestId, historialPrecios.id))
            .where(sql`${productos.id} IN ${productosVenta.map(p => p.id)}`);

          // Crear mapa de precios para fácil acceso
          const preciosPorProducto = new Map(
            preciosActuales.map(p => [p.productosId, { precio: p.precio, historialPreciosId: p.historialPreciosId }])
          );
          
          // Calcular el total de la venta usando los precios más recientes
          const totalVentaGeneral = productosVenta.reduce((total, item) => {
            const precioInfo = preciosPorProducto.get(item.id);
            if (!precioInfo) {
              throw new Error(`No se encontró precio para el producto ${item.id}`);
            }
            return total + (precioInfo.precio * item.cantidad);
          }, 0);
          
          // 1. Crear orden de venta
          await trx.insert(ordenesDeVentas).values({
            id: ordenVentaId,
            fechaOrden,
            totalVenta: totalVentaGeneral,
            personasId,
            usuariosId: usuarioId
          });
          
          // 2. Buscar el tipo de movimiento VENTA
          const tipoMovimientoResult = await trx
            .select({ id: catTipoMovimientos.id })
            .from(catTipoMovimientos)
            .where(eq(catTipoMovimientos.movimiento, "VENTA"))
            .limit(1);
          
          if (tipoMovimientoResult.length === 0) {
            throw new Error("No se encontró el tipo de movimiento VENTA");
          }
          
          const tipoMovimientoId = tipoMovimientoResult[0]!.id;
          
          // 3. Procesar cada producto
          for (const producto of productosVenta) {
            const { id: productoId, cantidad, ubicacionId } = producto;
            const precioInfo = preciosPorProducto.get(productoId);
            
            if (!precioInfo) {
              throw new Error(`No se encontró precio para el producto ${productoId}`);
            }
            
            // 3.1 Verificar y actualizar inventario
            const inventarioActual = await trx
              .select({ id: inventarios.id, cantidadDisponible: inventarios.cantidadDisponible })
              .from(inventarios)
              .where(
                and(
                  eq(inventarios.productosId, productoId),
                  eq(inventarios.ubicacionesId, ubicacionId)
                )
              )
              .limit(1);
            
            if (inventarioActual.length === 0) {
              throw new Error(`El producto no se encuentra en la ubicación especificada`);
            }
            
            const inventario = inventarioActual[0]!;
            
            if (inventario.cantidadDisponible < cantidad) {
              throw new Error(`Inventario insuficiente (${inventario.cantidadDisponible}) para el producto`);
            }
            
            // Actualizar inventario
            await trx
              .update(inventarios)
              .set({ cantidadDisponible: inventario.cantidadDisponible - cantidad })
              .where(eq(inventarios.id, inventario.id));
            
            // Registrar movimiento
            await trx.insert(movimientosInventarios).values({
              id: uuidv4(),
              productosId: productoId,
              ubicacionesId: ubicacionId,
              tipoMovimientosId: tipoMovimientoId,
              cantidad: -cantidad,
              fechaMovimiento: fechaOrden,
              usuariosId: usuarioId,
              claveMovimiento: `VENTA-${ordenVentaId.substring(0, 8)}`,
            });
            
            // Registrar detalle de venta
            await trx.insert(detallesOrdenesDeVentas).values({
              id: uuidv4(),
              ordenesDeVentasId: ordenVentaId,
              productosId: productoId,
              historialPreciosId: precioInfo.historialPreciosId,
              cantidad,
              totalVenta: precioInfo.precio * cantidad,
              metodosPagoId: metodoPagoId
            });
          }
          
          return {
            success: true,
            message: "Venta procesada correctamente",
            ventaId: ordenVentaId
          };
        });
      } catch (error) {
        console.error("Error al procesar la venta:", error);
        throw new Error(error instanceof Error ? error.message : "Error desconocido al procesar la venta");
      }
    }),

  // Obtener detalles de una venta
  getDetalleVenta: publicProcedure
    .input(z.object({ ventaId: z.string().uuid() })) // Mantenemos ventaId como input para claridad
    .query(async ({ input }) => {
      const { ventaId } = input; // Renombrado internamente a ordenesDeVentasId
      
      const detalles = await db
        .select({
          id: detallesOrdenesDeVentas.id,
          producto: {
            id: productos.id,
            nombre: productos.nombre
          },
          cantidad: detallesOrdenesDeVentas.cantidad,
          precioUnitario: historialPrecios.precio, // Seleccionado desde historialPrecios
          subtotal: detallesOrdenesDeVentas.totalVenta // Corregido y renombrado para claridad
        })
        .from(detallesOrdenesDeVentas)
        .innerJoin(productos, eq(detallesOrdenesDeVentas.productosId, productos.id)) // Corregido: productoId -> productosId
        .innerJoin(historialPrecios, eq(detallesOrdenesDeVentas.historialPreciosId, historialPrecios.id)) // Añadido Join
        .where(eq(detallesOrdenesDeVentas.ordenesDeVentasId, ventaId)); // Corregido: ventaId -> ordenesDeVentasId
      
      return detalles;
    }),
});