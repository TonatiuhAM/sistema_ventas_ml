import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `sistema_ventas_ml_${name}`);


// C A T A L O G O S #######################################
export const categoriasProductos = createTable("categorias_productos", {
  id: integer("id").primaryKey().notNull(),
  categoria: varchar("categoria", { length: 30 }).notNull(),
});

export const estados = createTable("estados", {
  id: integer("id").primaryKey().notNull(),
  estado: varchar("estado", { length: 20 }).notNull(),
});

export const categoriaPersonas = createTable("categoria_personas", {
  id: integer("id").primaryKey().notNull(),
  categoria: varchar("categoria", { length: 30 }).notNull(),
});

export const roles = createTable("roles", {
  id: integer("id").primaryKey().notNull(),
  roles: varchar("roles", { length: 20 }).notNull(),
});

export const metodosPago = createTable("metodos_pago", {
  id: integer("id").primaryKey().notNull(),
  metodoPago: varchar("metodo_pago", { length: 30 }).notNull(),
});

export const tipoMovimientos = createTable("tipo_movimientos", {
  id: integer("id").primaryKey().notNull(),
  movimiento: varchar("movimiento", { length: 12 }).notNull(),
});

export const ubicaciones = createTable("ubicaciones", {
  id: integer("id").primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  ubicacion: varchar("ubicacion", { length: 30 }).notNull(),
});

// T A B L A S #######################################
export const personas = createTable("personas", {
  id: integer("id").primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  apellidoPaterno: varchar("apellido_paterno", { length: 30 }).notNull(),
  apellidoMaterno: varchar("apellido_materno", { length: 30 }).notNull(),
  rfc: varchar("rfc", { length: 10 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull(),
  email: varchar("email", { length: 32 }).notNull(),
  estadosId: integer("estados_id").references(() => estados.id).notNull(),
  categoriaPersonasId: integer("categoria_personas_id")
    .references(() => categoriaPersonas.id)
    .notNull(),
});

export const productos = createTable("productos", {
  id: integer("id").primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  categoriasProductosId: integer("categorias_productos_id")
    .references(() => categoriasProductos.id)
    .notNull(),
  proveedorId: integer("proveedor_id").references(() => personas.id).notNull(),
  estadosId: integer("estados_id").references(() => estados.id).notNull(),
});

export const historialPrecios = createTable("historial_precios", {
  id: integer("id").primaryKey().notNull(),
  productosId: integer("productos_id").references(() => productos.id).notNull(),
  precio: integer("precio").notNull(),
  fechaDeRegistro: timestamp("fecha_de_registro", { withTimezone: true }).notNull(),
});

export const historialCostos = createTable("historial_costos", {
  id: integer("id").primaryKey().notNull(),
  productosId: integer("productos_id").references(() => productos.id).notNull(),
  costo: integer("costo").notNull(),
  fechaDeRegistro: timestamp("fecha_de_registro", { withTimezone: true }).notNull(),
});

export const usuarios = createTable("usuarios", {
  id: integer("id").primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  contrasena: varchar("contrasena", { length: 32 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull(),
  rolesId: integer("roles_id").references(() => roles.id).notNull(),
  estadosId: integer("estados_id").references(() => estados.id).notNull(),
});

export const ordenesDeVentas = createTable("ordenes_de_ventas", {
  id: integer("id").primaryKey().notNull(),
  personasId: integer("personas_id").references(() => personas.id).notNull(),
  fechaOrden: timestamp("fecha_orden", { withTimezone: true }).notNull(),
  usuariosId: integer("usuarios_id").references(() => usuarios.id).notNull(),
  totalVenta: integer("total_venta").notNull(),
});

export const detallesOrdenesDeVentas = createTable("detalles_ordenes_de_ventas", {
  id: integer("id").primaryKey().notNull(),
  ordenesDeVentasId: integer("ordenes_de_ventas_id")
    .references(() => ordenesDeVentas.id)
    .notNull(),
  productosId: integer("productos_id").references(() => productos.id).notNull(),
  historialPreciosId: integer("historial_precios_id")
    .references(() => historialPrecios.id)
    .notNull(),
  cantidad: integer("cantidad").notNull(),
  totalVenta: integer("total_venta").notNull(),
  metodosPagoId: integer("metodos_pago_id").references(() => metodosPago.id).notNull(),
});

export const historialPagosClientes = createTable("historial_pagos_clientes", {
  id: integer("id").primaryKey().notNull(),
  personasId: integer("personas_id").references(() => personas.id).notNull(),
  montoPagado: integer("monto_pagado").notNull(),
  fecha: timestamp("fecha", { withTimezone: true }).notNull(),
  metodosPagoId: integer("metodos_pago_id").references(() => metodosPago.id).notNull(),
});

export const ordenesDeCompras = createTable("ordenes_de_compras", {
  id: integer("id").primaryKey().notNull(),
  personaId: integer("persona_id").references(() => personas.id).notNull(),
  fechaOrden: timestamp("fecha_orden", { withTimezone: true }).notNull(),
  estadosId: integer("estados_id").references(() => estados.id).notNull(),
});

export const detallesOrdenesDeCompras = createTable("detalles_ordenes_de_compras", {
  id: integer("id").primaryKey().notNull(),
  ordenesDeComprasId: integer("ordenes_de_compras_id")
    .references(() => ordenesDeCompras.id)
    .notNull(),
  productoId: integer("producto_id").references(() => productos.id).notNull(),
  cantidad: integer("cantidad").notNull(),
  historialCostosId: integer("historial_costos_id")
    .references(() => historialCostos.id)
    .notNull(),
});

export const historialCargosProveedores = createTable("historial_cargos_proveedores", {
  id: integer("id").primaryKey().notNull(),
  personasId: integer("personas_id").references(() => personas.id).notNull(),
  montoPagado: integer("monto_pagado").notNull(),
  fecha: timestamp("fecha", { withTimezone: true }).notNull(),
  metodosPagoId: integer("metodos_pago_id").references(() => metodosPago.id).notNull(),
});

export const inventarios = createTable("inventarios", {
  id: integer("id").primaryKey().notNull(),
  productosId: integer("productos_id").references(() => productos.id).notNull(),
  ubicacionesId: integer("ubicaciones_id").references(() => ubicaciones.id).notNull(),
  cantidadDisponible: integer("cantidad_disponible").notNull(),
  cantidadMinima: integer("cantidad_minima").notNull(),
  cantidadMaxima: integer("cantidad_maxima").notNull(),
});

export const movimientosInventarios = createTable("movimientos_inventarios", {
  id: integer("id").primaryKey().notNull(),
  productosId: integer("productos_id").references(() => productos.id).notNull(),
  ubicacionesId: integer("ubicaciones_id").references(() => ubicaciones.id).notNull(),
  tipoMovimientosId: integer("tipo_movimientos_id")
    .references(() => tipoMovimientos.id)
    .notNull(),
  cantidad: integer("cantidad").notNull(),
  fechaMovimiento: timestamp("fecha_movimiento", { withTimezone: true }).notNull(),
  usuariosId: integer("usuarios_id").references(() => usuarios.id).notNull(),
  claveMovimiento: varchar("clave_movimiento", { length: 30 }).notNull(),
});

// Para calcular cuanto se reduce de un producto padre al vender un producto hijo
export const composicionProductos = createTable("composicion_productos", {
  id: integer("id").primaryKey().notNull(),
  productoPadreId: integer("producto_padre_id")
    .references(() => productos.id)
    .notNull(),
  productoHijoId: integer("producto_hijo_id")
    .references(() => productos.id)
    .notNull(),
  cantidadNecesaria: integer("cantidad_necesaria").notNull(),
  unidadMedidaHijo: varchar("unidad_medida_hijo", { length: 50 }).notNull(),
});

// R E L A C I O N E S #######################################
// Relación entre `categoriasProductos` y `productos`
export const productosRelations = relations(productos, ({ one, many }) => ({
  categoria: one(categoriasProductos, {
    fields: [productos.categoriasProductosId],
    references: [categoriasProductos.id],
  }),
  proveedor: one(personas, {
    fields: [productos.proveedorId],
    references: [personas.id],
  }),
  estado: one(estados, {
    fields: [productos.estadosId],
    references: [estados.id],
  }),
  historialPrecios: many(historialPrecios),
  historialCostos: many(historialCostos),
  inventarios: many(inventarios),
  composicionPadre: many(composicionProductos, {
    fields: [productos.id],
    references: [composicionProductos.productoPadreId],
  }),
  composicionHijo: many(composicionProductos, {
    fields: [productos.id],
    references: [composicionProductos.productoHijoId],
  }),
}));

// Relación entre `composicionProductos` y `productos`
export const composicionProductosRelations = relations(composicionProductos, ({ one }) => ({
  productoPadre: one(productos, {
    fields: [composicionProductos.productoPadreId],
    references: [productos.id],
  }),
  productoHijo: one(productos, {
    fields: [composicionProductos.productoHijoId],
    references: [productos.id],
  }),
}));

// Relación entre `personas` y otras tablas
export const personasRelations = relations(personas, ({ one, many }) => ({
  estado: one(estados, {
    fields: [personas.estadosId],
    references: [estados.id],
  }),
  categoria: one(categoriaPersonas, {
    fields: [personas.categoriaPersonasId],
    references: [categoriaPersonas.id],
  }),
  ordenesDeVentas: many(ordenesDeVentas),
  historialPagosClientes: many(historialPagosClientes),
  historialCargosProveedores: many(historialCargosProveedores),
}));

// Relación entre `ordenesDeVentas` y otras tablas
export const ordenesDeVentasRelations = relations(ordenesDeVentas, ({ one, many }) => ({
  cliente: one(personas, {
    fields: [ordenesDeVentas.personasId],
    references: [personas.id],
  }),
  usuario: one(usuarios, {
    fields: [ordenesDeVentas.usuariosId],
    references: [usuarios.id],
  }),
  detalles: many(detallesOrdenesDeVentas),
}));

// Relación entre `detallesOrdenesDeVentas` y otras tablas
export const detallesOrdenesDeVentasRelations = relations(detallesOrdenesDeVentas, ({ one }) => ({
  orden: one(ordenesDeVentas, {
    fields: [detallesOrdenesDeVentas.ordenesDeVentasId],
    references: [ordenesDeVentas.id],
  }),
  producto: one(productos, {
    fields: [detallesOrdenesDeVentas.productosId],
    references: [productos.id],
  }),
  historialPrecio: one(historialPrecios, {
    fields: [detallesOrdenesDeVentas.historialPreciosId],
    references: [historialPrecios.id],
  }),
  metodoPago: one(metodosPago, {
    fields: [detallesOrdenesDeVentas.metodosPagoId],
    references: [metodosPago.id],
  }),
}));

// Relación entre `inventarios` y otras tablas
export const inventariosRelations = relations(inventarios, ({ one }) => ({
  producto: one(productos, {
    fields: [inventarios.productosId],
    references: [productos.id],
  }),
  ubicacion: one(ubicaciones, {
    fields: [inventarios.ubicacionesId],
    references: [ubicaciones.id],
  }),
}));

// Relación entre `movimientosInventarios` y otras tablas
export const movimientosInventariosRelations = relations(movimientosInventarios, ({ one }) => ({
  producto: one(productos, {
    fields: [movimientosInventarios.productosId],
    references: [productos.id],
  }),
  ubicacion: one(ubicaciones, {
    fields: [movimientosInventarios.ubicacionesId],
    references: [ubicaciones.id],
  }),
  tipoMovimiento: one(tipoMovimientos, {
    fields: [movimientosInventarios.tipoMovimientosId],
    references: [tipoMovimientos.id],
  }),
  usuario: one(usuarios, {
    fields: [movimientosInventarios.usuariosId],
    references: [usuarios.id],
  }),
}));