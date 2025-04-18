import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db"; // Conexión a la base de datos
import { productos, historialPrecios, historialCostos, catCategoriasProductos, personas, catEstados, catCategoriaPersonas } from "~/server/db/schema"; // Esquema de productos en Drizzle
import { eq, lte, desc, and } from "drizzle-orm"; // Importar también and
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

    // Actualizar un producto con su precio
    updateWithPrice: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                nombre: z.string().max(30),
                categoriasProductosId: z.string().uuid(),
                proveedorId: z.string().uuid(),
                estadosId: z.string().uuid(),
                precio: z.number(),
                actualizarPrecio: z.boolean().default(false),
            })
        )
        .mutation(async ({ input }) => {
            const { id, precio, actualizarPrecio, ...productData } = input;
            
            try {
                return await db.transaction(async (trx) => {
                    // Actualizar los datos del producto
                    const updatedProduct = await trx.update(productos)
                        .set(productData)
                        .where(eq(productos.id, id))
                        .returning();
                    
                    // Si se debe actualizar el precio, registrar nuevo precio
                    if (actualizarPrecio) {
                        await trx.insert(historialPrecios).values({
                            id: uuidv4(),
                            productosId: id,
                            precio,
                            fechaDeRegistro: new Date(),
                        });
                    }
                    
                    return { 
                        success: true,
                        data: updatedProduct
                    };
                });
            } catch (error) {
                console.error("Error al actualizar el producto:", error);
                throw new Error(error instanceof Error ? error.message : "Error desconocido al actualizar el producto");
            }
        }),

    // Eliminar un producto y su historial de precios
    delete: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input }) => {
            try {
                // Utilizar una transacción para asegurar la consistencia
                return await db.transaction(async (trx) => {
                    // Primero eliminar el historial de precios asociado
                    await trx.delete(historialPrecios)
                        .where(eq(historialPrecios.productosId, input.id));
                    
                    // Luego eliminar el producto
                    const deletedProduct = await trx.delete(productos)
                        .where(eq(productos.id, input.id))
                        .returning();
                    
                    return deletedProduct;
                });
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                throw new Error(error instanceof Error ? error.message : "Error desconocido al eliminar el producto");
            }
        }),

    // Obtener productos con su precio más reciente
    getAllWithPrices: publicProcedure.query(async () => {
        // 1. Primero obtenemos todos los productos
        const allProducts = await db.select().from(productos);
        
        // 2. Para cada producto, buscamos su precio más reciente
        const productsWithPrices = await Promise.all(
            allProducts.map(async (product) => {
                // Buscar el precio más reciente para este producto
                const latestPrice = await db
                    .select()
                    .from(historialPrecios)
                    .where(
                        and(
                            eq(historialPrecios.productosId, product.id),
                            lte(historialPrecios.fechaDeRegistro, new Date())
                        )
                    )
                    .orderBy(desc(historialPrecios.fechaDeRegistro))
                    .limit(1);

                // Combinar el producto con su precio más reciente
                return {
                    id: product.id,
                    nombre: product.nombre,
                    categoriasProductosId: product.categoriasProductosId,
                    proveedorId: product.proveedorId,
                    estadosId: product.estadosId,
                    precio: latestPrice[0]?.precio ?? null,
                    fechaDeRegistro: latestPrice[0]?.fechaDeRegistro ?? null,
                };
            })
        );

        return productsWithPrices;
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