import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db"; // Conexión a la base de datos
import { productos, historialPrecios, historialCostos } from "~/server/db/schema"; // Esquema de productos en Drizzle
import { eq, lte, desc } from "drizzle-orm"; // Importa la función 'eq'

export const inventoryRouter = createTRPCRouter({
    // Obtener todos los productos
    getAll: publicProcedure.query(async () => {
        return await db.select().from(productos);
    }),

    // Crear un nuevo producto
    create: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                nombre: z.string().max(30),
                categoriasProductosId: z.string().uuid(),
                proveedorId: z.string().uuid(),
                estadosId: z.string().uuid(),
            })
        )
        .mutation(async ({ input }) => {
            return await db.insert(productos).values(input).returning();
        }),

    // Actualizar un producto
    update: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                nombre: z.string().max(30).optional(),
                categoriasProductosId: z.string().uuid().optional(),
                proveedorId: z.string().uuid().optional(),
                estadosId: z.string().uuid().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { id, ...data } = input;
            return await db.update(productos).set(data).where(eq(productos.id, id)).returning();
        }),

    // Eliminar un producto
    delete: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input }) => {
            return await db.delete(productos).where(eq(productos.id, input.id)).returning();
        }),
    
    // Obtener productos con su precio más reciente
    getAllWithPrices: publicProcedure.query(async () => {
        const result = await db
            .select({
                id: productos.id,
                nombre: productos.nombre,
                precio: historialPrecios.precio,
                fechaDeRegistro: historialPrecios.fechaDeRegistro,
            })
            .from(productos)
            .leftJoin(
                historialPrecios,
                eq(historialPrecios.productosId, productos.id) // Usa 'eq' aquí también por consistencia
            )
            .where(lte(historialPrecios.fechaDeRegistro, new Date())) // Usa la función 'lte'
            .orderBy(desc(historialPrecios.fechaDeRegistro)) // Usa la función 'desc'
            .limit(1);

        return result;
    }),

});