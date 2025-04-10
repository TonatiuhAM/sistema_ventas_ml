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


export const createTable = pgTableCreator((name) => name);

// C A T A L O G O S #######################################
export const catCategoriasProductos = createTable("categorias_productos", { 
  id: integer("id").primaryKey().notNull(),
  categoria: varchar("categoria", { length: 30 }).notNull(),
});

export const catEstados = createTable("estados", {
  id: integer("id").primaryKey().notNull(),
  estado: varchar("estado", { length: 20 }).notNull(),
});

export const catCategoriaPersonas = createTable("categoria_personas", {
  id: integer("id").primaryKey().notNull(),
  categoria: varchar("categoria", { length: 30 }).notNull(),
});

export const catRoles = createTable("roles", {
  id: integer("id").primaryKey().notNull(),
  roles: varchar("roles", { length: 20 }).notNull(),
});

export const catMetodosPago = createTable("metodos_pago", {
  id: integer("id").primaryKey().notNull(),
  metodoPago: varchar("metodo_pago", { length: 30 }).notNull(),
});

export const catTipoMovimientos = createTable("tipo_movimientos", {
  id: integer("id").primaryKey().notNull(),
  movimiento: varchar("movimiento", { length: 12 }).notNull(),
});

export const catUbicaciones = createTable("ubicaciones", {
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
  estadosId: integer("estados_id").references(() => catEstados.id).notNull(),
  categoriaPersonasId: integer("categoria_personas_id")
    .references(() => catCategoriaPersonas.id)
    .notNull(),
});

export const productos = createTable("productos", {
  id: integer("id").primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  categoriasProductosId: integer("categorias_productos_id")
    .references(() => catCategoriasProductos.id)
    .notNull(),
  proveedorId: integer("proveedor_id").references(() => personas.id).notNull(),
  estadosId: integer("estados_id").references(() => catEstados.id).notNull(),
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
  rolesId: integer("roles_id").references(() => catRoles.id).notNull(),
  estadosId: integer("estados_id").references(() => catEstados.id).notNull(),
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
  metodosPagoId: integer("metodos_pago_id").references(() => catMetodosPago.id).notNull(),
});

export const historialPagosClientes = createTable("historial_pagos_clientes", {
  id: integer("id").primaryKey().notNull(),
  personasId: integer("personas_id").references(() => personas.id).notNull(),
  montoPagado: integer("monto_pagado").notNull(),
  fecha: timestamp("fecha", { withTimezone: true }).notNull(),
  metodosPagoId: integer("metodos_pago_id").references(() => catMetodosPago.id).notNull(),
});

export const ordenesDeCompras = createTable("ordenes_de_compras", {
  id: integer("id").primaryKey().notNull(),
  personaId: integer("persona_id").references(() => personas.id).notNull(),
  fechaOrden: timestamp("fecha_orden", { withTimezone: true }).notNull(),
  estadosId: integer("estados_id").references(() => catEstados.id).notNull(),
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
  metodosPagoId: integer("metodos_pago_id").references(() => catMetodosPago.id).notNull(),
});

export const inventarios = createTable("inventarios", {
  id: integer("id").primaryKey().notNull(),
  productosId: integer("productos_id").references(() => productos.id).notNull(),
  ubicacionesId: integer("ubicaciones_id").references(() => catUbicaciones.id).notNull(),
  cantidadDisponible: integer("cantidad_disponible").notNull(),
  cantidadMinima: integer("cantidad_minima").notNull(),
  cantidadMaxima: integer("cantidad_maxima").notNull(),
});

export const movimientosInventarios = createTable("movimientos_inventarios", {
  id: integer("id").primaryKey().notNull(),
  productosId: integer("productos_id").references(() => productos.id).notNull(),
  ubicacionesId: integer("ubicaciones_id").references(() => catUbicaciones.id).notNull(),
  tipoMovimientosId: integer("tipo_movimientos_id")
    .references(() => catTipoMovimientos.id)
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
  categoria: one(catCategoriasProductos, {
    fields: [productos.categoriasProductosId],
    references: [catCategoriasProductos.id],
  }),
  proveedor: one(personas, {
    fields: [productos.proveedorId],
    references: [personas.id],
  }),
  estado: one(catEstados, {
    fields: [productos.estadosId],
    references: [catEstados.id],
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
  estado: one(catEstados, {
    fields: [personas.estadosId],
    references: [catEstados.id],
  }),
  categoria: one(catCategoriaPersonas, {
    fields: [personas.categoriaPersonasId],
    references: [catCategoriaPersonas.id],
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
  metodoPago: one(catMetodosPago, {
    fields: [detallesOrdenesDeVentas.metodosPagoId],
    references: [catMetodosPago.id],
  }),
}));

// Relación entre `inventarios` y otras tablas
export const inventariosRelations = relations(inventarios, ({ one }) => ({
  producto: one(productos, {
    fields: [inventarios.productosId],
    references: [productos.id],
  }),
  ubicacion: one(catUbicaciones, {
    fields: [inventarios.ubicacionesId],
    references: [catUbicaciones.id],
  }),
}));

// Relación entre `movimientosInventarios` y otras tablas
export const movimientosInventariosRelations = relations(movimientosInventarios, ({ one }) => ({
  producto: one(productos, {
    fields: [movimientosInventarios.productosId],
    references: [productos.id],
  }),
  ubicacion: one(catUbicaciones, {
    fields: [movimientosInventarios.ubicacionesId],
    references: [catUbicaciones.id],
  }),
  tipoMovimiento: one(catTipoMovimientos, {
    fields: [movimientosInventarios.tipoMovimientosId],
    references: [catTipoMovimientos.id],
  }),
  usuario: one(usuarios, {
    fields: [movimientosInventarios.usuariosId],
    references: [usuarios.id],
  }),
}));