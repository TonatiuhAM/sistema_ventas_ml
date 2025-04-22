import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db"; // Conexión a la base de datos
import { 
  productos, historialPrecios, historialCostos, catCategoriasProductos, personas, 
  catEstados, catCategoriaPersonas, inventarios, catUbicaciones, movimientosInventarios, 
  catTipoMovimientos, usuarios, catRoles 
} from "~/server/db/schema"; // Esquema de productos en Drizzle
import { eq, lte, desc, max, sql, and } from "drizzle-orm"; // Importar también and
import { v4 as uuidv4 } from "uuid"; // Importa uuid para generar identificadores únicos

// ID fijo para el usuario sistema
const SISTEMA_ID = "00000000-0000-0000-0000-000000000000";

// Función para asegurar que exista el usuario sistema
async function asegurarUsuarioSistema() {
  try {
    // Verificar si el usuario sistema ya existe
    const usuarioExistente = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, SISTEMA_ID))
      .limit(1);
    
    if (usuarioExistente.length === 0) {
      console.log("Usuario sistema no encontrado, creando...");
      
      // Buscar rol para usuario sistema
      let rolId;
      const rolAdmin = await db
        .select()
        .from(catRoles)
        .where(eq(catRoles.roles, "Administrador"))  // Usando "roles" en lugar de "rol"
        .limit(1);
      
      if (rolAdmin.length > 0) {
        rolId = rolAdmin[0]?.id;  // Usando el operador de navegación segura
        
        if (!rolId) {
          throw new Error("No se pudo obtener el ID del rol administrador");
        }
      } else {
        // Crear rol si no existe
        const nuevoRolId = uuidv4();
        await db.insert(catRoles).values({
          id: nuevoRolId,
          roles: "Administrador"  // Usando "roles" en lugar de "rol"
        });
        rolId = nuevoRolId;
      }
      
      // Crear el usuario sistema
      await db.insert(usuarios).values({
        id: SISTEMA_ID,
        nombre: "Sistema",
        contrasena: "sistema", // Nombre correcto del campo
        telefono: "0000000000", // Campo requerido
        rolesId: rolId,
        estadosId: await obtenerEstadoActivo() // Función para obtener un estado activo
      });
      
      console.log("Usuario sistema creado exitosamente");
    } else {
      console.log("Usuario sistema ya existe");
    }
    
    return true;
  } catch (error) {
    console.error("Error al asegurar usuario sistema:", error);
    return false;
  }
}

// Función auxiliar para obtener un ID de estado activo
async function obtenerEstadoActivo() {
  // Buscar un estado activo o el primero disponible
  const estado = await db
    .select()
    .from(catEstados)
    .where(eq(catEstados.estado, "Activo"))
    .limit(1);
    
  if (estado.length > 0 && estado[0]) {
    return estado[0].id;
  }
  
  // Si no hay un estado "Activo", usar el primer estado disponible
  const primerEstado = await db
    .select()
    .from(catEstados)
    .limit(1);
    
  if (primerEstado.length > 0 && primerEstado[0]) {
    return primerEstado[0].id;
  }
  
  // Si no hay estados, crear uno
  const nuevoEstadoId = uuidv4();
  await db.insert(catEstados).values({
    id: nuevoEstadoId,
    estado: "Activo"
  });
  
  return nuevoEstadoId;
}

// Función para asegurar que existan todos los tipos de movimientos necesarios
async function asegurarTipoMovimientos() {
  try {
    // Lista de tipos de movimiento que deben existir
    const tiposNecesarios = ["CREACION", "COMPRA", "VENTA", "ENTRADA", "SALIDA", "EDICION"];
    
    // Verificar cuáles ya existen
    const tiposExistentes = await db
      .select()
      .from(catTipoMovimientos);
      
    const movimientosExistentes = tiposExistentes.map(tipo => tipo.movimiento);
    console.log("Tipos de movimientos existentes:", movimientosExistentes);
    
    // Crear los que no existen
    for (const tipo of tiposNecesarios) {
      if (!movimientosExistentes.includes(tipo)) {
        console.log(`Creando tipo de movimiento: ${tipo}`);
        await db.insert(catTipoMovimientos).values({
          id: uuidv4(),
          movimiento: tipo
        });
      }
    }
    
    console.log("Verificación de tipos de movimientos completada");
    return true;
  } catch (error) {
    console.error("Error al asegurar tipos de movimientos:", error);
    return false;
  }
}

// Inicializar catálogos
async function inicializarCatalogos() {
  await asegurarUsuarioSistema();
  await asegurarTipoMovimientos();
}

// Inicializar al cargar el router
inicializarCatalogos();

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
                // Nuevos campos para inventario
                ubicacionId: z.string().uuid(),
                cantidadActual: z.number().int().min(0),
                cantidadMaxima: z.number().int().min(0),
                cantidadMinima: z.number().int().min(0),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { 
                id, nombre, categoriasProductosId, proveedorId, estadosId, precio,
                ubicacionId, cantidadActual, cantidadMaxima, cantidadMinima 
            } = input;
            const fechaDeRegistro = new Date();

            try {
                // Asegurar que existe el usuario sistema antes de continuar
                await asegurarUsuarioSistema();
                
                console.log("Iniciando creación de producto:", { id, nombre });
                
                // Validar que las claves foráneas existan
                const categoriaExiste = await db
                    .select()
                    .from(catCategoriasProductos)
                    .where(eq(catCategoriasProductos.id, categoriasProductosId))
                    .limit(1);
                console.log("Categoría existe:", categoriaExiste);

                const proveedorExiste = await db
                    .select()
                    .from(personas)
                    .where(eq(personas.id, proveedorId))
                    .limit(1);
                console.log("Proveedor existe:", proveedorExiste);

                const estadoExiste = await db
                    .select()
                    .from(catEstados)
                    .where(eq(catEstados.id, estadosId))
                    .limit(1);
                console.log("Estado existe:", estadoExiste);

                const ubicacionExiste = await db
                    .select()
                    .from(catUbicaciones)
                    .where(eq(catUbicaciones.id, ubicacionId))
                    .limit(1);
                console.log("Ubicación existe:", ubicacionExiste);

                if (!categoriaExiste.length || !proveedorExiste.length || !estadoExiste.length || !ubicacionExiste.length) {
                    throw new Error("Una o más claves foráneas no existen.");
                }

                // Iniciar transacción para crear producto, registrar precio e inventario inicial
                const productoCreado = await db.transaction(async (trx) => {
                    try {
                        console.log("Iniciando transacción");
                        
                        // Crear producto
                        console.log("Insertando producto");
                        const nuevoProducto = await trx.insert(productos).values({
                            id,
                            nombre,
                            categoriasProductosId,
                            proveedorId,
                            estadosId,
                        }).returning();
                        console.log("Producto insertado:", nuevoProducto);

                        // Registrar precio en historialPrecios
                        console.log("Insertando historial de precios");
                        const precioId = uuidv4();
                        await trx.insert(historialPrecios).values({
                            id: precioId,
                            productosId: id,
                            precio,
                            fechaDeRegistro,
                        });
                        console.log("Historial de precios insertado con ID:", precioId);

                        // Registrar inventario inicial
                        console.log("Insertando inventario inicial");
                        const inventarioId = uuidv4();
                        await trx.insert(inventarios).values({
                            id: inventarioId,
                            productosId: id,
                            ubicacionesId: ubicacionId,
                            cantidadDisponible: cantidadActual,
                            cantidadMinima: cantidadMinima,
                            cantidadMaxima: cantidadMaxima,
                        });
                        console.log("Inventario insertado con ID:", inventarioId);

                        // Buscar el tipo de movimiento CREACION
                        console.log("Buscando tipo de movimiento CREACION");
                        const tipoMovimientoCreacion = await trx
                            .select()
                            .from(catTipoMovimientos)
                            .where(eq(catTipoMovimientos.movimiento, "CREACION"))
                            .limit(1);
                        console.log("Tipo de movimiento encontrado:", tipoMovimientoCreacion);

                        if (!tipoMovimientoCreacion.length) {
                            throw new Error("No se encontró el tipo de movimiento CREACION");
                        }

                        // Aseguramos que existe el primer elemento antes de usarlo
                        const tipoCreacion = tipoMovimientoCreacion[0]!;

                        // Registrar movimiento inicial de tipo CREACION
                        console.log("Insertando movimiento de inventario");
                        const movimientoId = uuidv4();
                        await trx.insert(movimientosInventarios).values({
                            id: movimientoId,
                            productosId: id,
                            ubicacionesId: ubicacionId,
                            tipoMovimientosId: tipoCreacion.id,
                            cantidad: cantidadActual,
                            fechaMovimiento: fechaDeRegistro,
                            usuariosId: SISTEMA_ID, // Usar el ID fijo del usuario sistema
                            claveMovimiento: `CREACION-${id.substring(0, 8)}`,
                        });
                        console.log("Movimiento insertado con ID:", movimientoId);

                        return nuevoProducto;
                    } catch (txError) {
                        console.error("Error dentro de la transacción:", txError);
                        throw txError;
                    }
                });

                console.log("Producto creado exitosamente:", productoCreado);
                return { success: true, data: productoCreado };
            } catch (error) {
                console.error("Error detallado al crear el producto:", error);
                if (error instanceof Error) {
                    console.error("Mensaje de error:", error.message);
                    console.error("Stack trace:", error.stack);
                }
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

    // Actualizar un producto con inventario y registrar el movimiento
    updateProductWithInventory: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                nombre: z.string().max(30),
                categoriasProductosId: z.string().uuid(),
                proveedorId: z.string().uuid(),
                estadosId: z.string().uuid(),
                precio: z.number(),
                actualizarPrecio: z.boolean().default(false),
                ubicacionId: z.string().uuid(),
                cantidadActual: z.number().int().min(0).optional(),
                cantidadMaxima: z.number().int().min(0).optional(),
                cantidadMinima: z.number().int().min(0).optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { 
                id, precio, actualizarPrecio, ubicacionId,
                cantidadActual, cantidadMaxima, cantidadMinima,
                ...productData 
            } = input;
            
            try {
                return await db.transaction(async (trx) => {
                    // 1. Actualizar los datos del producto
                    const updatedProduct = await trx.update(productos)
                        .set(productData)
                        .where(eq(productos.id, id))
                        .returning();
                    
                    // 2. Si se debe actualizar el precio, registrar nuevo precio
                    if (actualizarPrecio) {
                        await trx.insert(historialPrecios).values({
                            id: uuidv4(),
                            productosId: id,
                            precio,
                            fechaDeRegistro: new Date(),
                        });
                    }
                    
                    // 3. Verificar si el inventario necesita ser actualizado
                    const inventarioActual = await trx
                        .select()
                        .from(inventarios)
                        .where(
                            and(
                                eq(inventarios.productosId, id),
                                eq(inventarios.ubicacionesId, ubicacionId)
                            )
                        )
                        .limit(1);
                    
                    // Si existe el inventario y hay valores a actualizar
                    if (inventarioActual.length > 0) {
                        const updateData: Record<string, unknown> = {};
                        
                        if (cantidadMaxima !== undefined) {
                            updateData.cantidadMaxima = cantidadMaxima;
                        }
                        
                        if (cantidadMinima !== undefined) {
                            updateData.cantidadMinima = cantidadMinima;
                        }
                        
                        if (Object.keys(updateData).length > 0) {
                            await trx.update(inventarios)
                                .set(updateData)
                                .where(eq(inventarios.id, inventarioActual[0]!.id));
                        }
                    } else {
                        // Si el inventario no existe en esa ubicación y hay cantidad, crear nuevo
                        if (cantidadActual !== undefined && cantidadActual > 0) {
                            if (cantidadMaxima === undefined || cantidadMinima === undefined) {
                                throw new Error("Para crear un nuevo inventario se requieren cantidades mínima y máxima");
                            }
                            
                            await trx.insert(inventarios).values({
                                id: uuidv4(),
                                productosId: id,
                                ubicacionesId: ubicacionId,
                                cantidadDisponible: cantidadActual,
                                cantidadMinima: cantidadMinima,
                                cantidadMaxima: cantidadMaxima,
                            });
                        }
                    }
                    
                    // 4. Buscar el tipo de movimiento EDICION
                    const tipoMovimientoEdicion = await trx
                        .select()
                        .from(catTipoMovimientos)
                        .where(eq(catTipoMovimientos.movimiento, "EDICION"))
                        .limit(1);
                    
                    if (tipoMovimientoEdicion.length === 0) {
                        throw new Error("No se encontró el tipo de movimiento EDICION");
                    }
                    
                    // 5. Registrar movimiento de tipo EDICION con cantidad 0
                    const movimientoId = uuidv4();
                    await trx.insert(movimientosInventarios).values({
                        id: movimientoId,
                        productosId: id,
                        ubicacionesId: ubicacionId,
                        tipoMovimientosId: tipoMovimientoEdicion[0]!.id,
                        cantidad: 0, // La edición no afecta la cantidad
                        fechaMovimiento: new Date(),
                        usuariosId: ctx.session?.user?.id || SISTEMA_ID,
                        claveMovimiento: `EDICION-${movimientoId.substring(0, 8)}`,
                    });
                    
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
        // Subconsulta para obtener el ID del último historial de precios para cada producto
        const latestPriceSubquery = db
            .select({
                productosId: historialPrecios.productosId,
                maxId: max(historialPrecios.id).as("maxId"),
            })
            .from(historialPrecios)
            .where(lte(historialPrecios.fechaDeRegistro, new Date()))
            .groupBy(historialPrecios.productosId)
            .as("latest_prices");

        const result = await db
            .select({
                id: productos.id,
                nombre: productos.nombre,
                categoriasProductosId: productos.categoriasProductosId,
                proveedorId: productos.proveedorId,
                estadosId: productos.estadosId,
                precio: historialPrecios.precio,
                fechaDeRegistro: historialPrecios.fechaDeRegistro,
            })
            .from(productos)
            .leftJoin(latestPriceSubquery, eq(productos.id, latestPriceSubquery.productosId))
            .leftJoin(historialPrecios, eq(latestPriceSubquery.maxId, historialPrecios.id))
            .orderBy(productos.nombre);

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

    // Obtener ubicaciones
    fetchUbicaciones: publicProcedure.query(async () => {
        return await db.select().from(catUbicaciones);
    }),

    // Obtener tipos de movimientos
    fetchTipoMovimientos: publicProcedure.query(async () => {
        return await db.select().from(catTipoMovimientos);
    }),

    // Registrar un movimiento de inventario (compra, venta, edición)
    registrarMovimiento: publicProcedure
        .input(
            z.object({
                productoId: z.string().uuid(),
                ubicacionId: z.string().uuid(),
                tipoMovimientoId: z.string().uuid(),
                cantidad: z.number().int(),
                comentario: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { productoId, ubicacionId, tipoMovimientoId, cantidad, comentario } = input;
            const fechaMovimiento = new Date();

            try {
                return await db.transaction(async (trx) => {
                    // Verificar que el producto y la ubicación existan
                    const inventarioActual = await trx
                        .select()
                        .from(inventarios)
                        .where(
                            and(
                                eq(inventarios.productosId, productoId),
                                eq(inventarios.ubicacionesId, ubicacionId)
                            )
                        )
                        .limit(1);

                    if (!inventarioActual.length) {
                        throw new Error("No se encontró el producto en la ubicación especificada");
                    }

                    // Aseguramos que existe el registro de inventario
                    const registroInventario = inventarioActual[0]!;

                    // Obtener el tipo de movimiento
                    const tipoMovimiento = await trx
                        .select()
                        .from(catTipoMovimientos)
                        .where(eq(catTipoMovimientos.id, tipoMovimientoId))
                        .limit(1);

                    if (!tipoMovimiento.length) {
                        throw new Error("Tipo de movimiento no válido");
                    }

                    // Aseguramos que existe el tipo de movimiento
                    const tipoMovimientoRecord = tipoMovimiento[0]!;

                    // Actualizar el inventario según el tipo de movimiento
                    let nuevaCantidad = registroInventario.cantidadDisponible;

                    if (tipoMovimientoRecord.movimiento === "COMPRA" || tipoMovimientoRecord.movimiento === "ENTRADA") {
                        nuevaCantidad += cantidad;
                    } else if (tipoMovimientoRecord.movimiento === "VENTA" || tipoMovimientoRecord.movimiento === "SALIDA") {
                        nuevaCantidad -= cantidad;
                        
                        // Validar que no se venda más de lo disponible
                        if (nuevaCantidad < 0) {
                            throw new Error("No hay suficiente stock disponible para realizar esta operación");
                        }
                    }

                    // Actualizar el inventario
                    await trx
                        .update(inventarios)
                        .set({ cantidadDisponible: nuevaCantidad })
                        .where(eq(inventarios.id, registroInventario.id));

                    // Registrar el movimiento de inventario
                    const movimientoId = uuidv4();
                    await trx.insert(movimientosInventarios).values({
                        id: movimientoId,
                        productosId: productoId,
                        ubicacionesId: ubicacionId,
                        tipoMovimientosId: tipoMovimientoId,
                        cantidad: cantidad,
                        fechaMovimiento: fechaMovimiento,
                        usuariosId: ctx.session?.user?.id || "00000000-0000-0000-0000-000000000000", // ID genérico cuando no hay sesión
                        claveMovimiento: `${tipoMovimientoRecord.movimiento}-${movimientoId.substring(0, 8)}`,
                    });

                    return { 
                        success: true, 
                        message: `Movimiento de ${tipoMovimientoRecord.movimiento} registrado correctamente` 
                    };
                });
            } catch (error) {
                console.error("Error al registrar el movimiento:", error);
                throw new Error(error instanceof Error ? error.message : "Error desconocido al registrar el movimiento");
            }
        }),

    // Obtener el inventario actual de todos los productos con su precio más reciente
    getInventarioActual: publicProcedure.query(async () => {
        // Subconsulta para obtener el ID del último historial de precios para cada producto
        const latestPriceSubquery = db
            .select({
                productosId: historialPrecios.productosId,
                latestId: max(historialPrecios.id).as("latestId"),
            })
            .from(historialPrecios)
            .where(lte(historialPrecios.fechaDeRegistro, new Date()))
            .groupBy(historialPrecios.productosId)
            .as("latestPriceSubquery");

        const result = await db
            .select({
                producto: {
                    id: productos.id,
                    nombre: productos.nombre,
                    categoriasProductosId: productos.categoriasProductosId,
                    proveedorId: productos.proveedorId,
                    estadosId: productos.estadosId,
                },
                inventario: {
                    id: inventarios.id,
                    cantidadDisponible: inventarios.cantidadDisponible,
                    cantidadMinima: inventarios.cantidadMinima,
                    cantidadMaxima: inventarios.cantidadMaxima,
                },
                ubicacion: {
                    id: catUbicaciones.id,
                    nombre: catUbicaciones.nombre,
                    ubicacion: catUbicaciones.ubicacion,
                },
                precio: historialPrecios.precio,
                fechaActualizacionPrecio: historialPrecios.fechaDeRegistro,
            })
            .from(inventarios)
            .innerJoin(productos, eq(inventarios.productosId, productos.id))
            .innerJoin(catUbicaciones, eq(inventarios.ubicacionesId, catUbicaciones.id))
            .leftJoin(latestPriceSubquery, eq(productos.id, latestPriceSubquery.productosId))
            .leftJoin(historialPrecios, eq(latestPriceSubquery.latestId, historialPrecios.id))
            .orderBy(productos.nombre);

        return result;
    }),

    // Obtener historial de movimientos de un producto
    getMovimientosProducto: publicProcedure
        .input(z.object({ productoId: z.string().uuid() }))
        .query(async ({ input }) => {
            const { productoId } = input;

            const result = await db
                .select({
                    id: movimientosInventarios.id,
                    fecha: movimientosInventarios.fechaMovimiento,
                    cantidad: movimientosInventarios.cantidad,
                    claveMovimiento: movimientosInventarios.claveMovimiento,
                    tipoMovimiento: catTipoMovimientos.movimiento,
                    ubicacion: {
                        nombre: catUbicaciones.nombre,
                        ubicacion: catUbicaciones.ubicacion,
                    },
                    usuario: {
                        nombre: usuarios.nombre,
                    }
                })
                .from(movimientosInventarios)
                .innerJoin(catTipoMovimientos, eq(movimientosInventarios.tipoMovimientosId, catTipoMovimientos.id))
                .innerJoin(catUbicaciones, eq(movimientosInventarios.ubicacionesId, catUbicaciones.id))
                .leftJoin(usuarios, eq(movimientosInventarios.usuariosId, usuarios.id))
                .where(eq(movimientosInventarios.productosId, productoId))
                .orderBy(desc(movimientosInventarios.fechaMovimiento));

            return result;
        }),

});