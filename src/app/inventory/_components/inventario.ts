import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db"; // Conexión a la base de datos
import { productos, historialPrecios, historialCostos, catCategoriasProductos, personas, catEstados, catCategoriaPersonas } from "~/server/db/schema"; // Esquema de productos en Drizzle
import { eq, lte, desc } from "drizzle-orm"; // Importa la función 'eq'
import { v4 as uuidv4 } from "uuid"; // Importa uuid para generar identificadores únicos

export const inventoryRouter = createTRPCRouter({
    // Obtener todos los productos
    getAll: publicProcedure.query(async () => {
        return await db.select().from(productos);
    }),

    // Crear un nuevo producto con validación y manejo de errores
    create: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                nombre: z.string().max(30),
                categoriasProductosId: z.string().uuid(),
                proveedorId: z.string().uuid(),
                estadosId: z.string().uuid(),
                precio: z.number(),
            })
        )
        .mutation(async ({ input }) => {
            const { id, nombre, categoriasProductosId, proveedorId, estadosId, precio } = input;
            const fechaDeRegistro = new Date();

            try {
                // Validar que las claves foráneas existan
                const categoriaExiste = await db
                    .select()
                    .from(catCategoriasProductos)
                    .where(eq(catCategoriasProductos.id, categoriasProductosId))
                    .limit(1);

                const proveedorExiste = await db
                    .select()
                    .from(personas)
                    .where(eq(personas.id, proveedorId))
                    .limit(1);

                const estadoExiste = await db
                    .select()
                    .from(catEstados)
                    .where(eq(catEstados.id, estadosId))
                    .limit(1);

                if (!categoriaExiste.length || !proveedorExiste.length || !estadoExiste.length) {
                    throw new Error("Una o más claves foráneas no existen.");
                }

                // Iniciar transacción para crear producto y registrar precio
                const productoCreado = await db.transaction(async (trx) => {
                    // Crear producto
                    const nuevoProducto = await trx.insert(productos).values({
                        id,
                        nombre,
                        categoriasProductosId,
                        proveedorId,
                        estadosId,
                    }).returning();

                    // Registrar precio en historialPrecios
                    await trx.insert(historialPrecios).values({
                        id: uuidv4(),
                        productosId: id,
                        precio,
                        fechaDeRegistro,
                    });

                    return nuevoProducto;
                });

                return { success: true, data: productoCreado };
            } catch (error) {
                console.error("Error al crear el producto:", error);
                throw new Error(error instanceof Error ? error.message : "Error desconocido en el servidor.");
            }
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
                eq(historialPrecios.productosId, productos.id)
            )
            .where(lte(historialPrecios.fechaDeRegistro, new Date()))
            .orderBy(desc(historialPrecios.fechaDeRegistro)); // Eliminar limit(1) para devolver todos los productos

        return result;
    }),

    // Obtener categorías
    fetchCategorias: publicProcedure.query(async () => {
        return await db.select().from(catCategoriasProductos);
    }),

    // Obtener proveedores
    fetchProveedores: publicProcedure.query(async () => {
        // Buscar la PK de la categoría "Proveedor"
        const proveedorCategoria = await db
            .select({ id: catCategoriaPersonas.id })
            .from(catCategoriaPersonas)
            .where(eq(catCategoriaPersonas.categoria, "Proveedor"))
            .limit(1);

        if (!proveedorCategoria.length) {
            throw new Error("No se encontró la categoría 'Proveedor' en la base de datos.");
        }

        const proveedorCategoriaId = proveedorCategoria[0]?.id;

        if (!proveedorCategoriaId) {
            throw new Error("No se encontró un ID válido para la categoría 'Proveedor'.");
        }

        // Buscar personas que tengan la FK de la categoría "Proveedor"
        return await db
            .select({ id: personas.id, nombre: personas.nombre })
            .from(personas)
            .where(eq(personas.categoriaPersonasId, proveedorCategoriaId));
    }),

    // Obtener estados
    fetchEstados: publicProcedure.query(async () => {
        return await db.select().from(catEstados);
    }),

});