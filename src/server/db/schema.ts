import { relations } from "drizzle-orm";
import {
  index,
  varchar,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => name);

// C A T A L O G O S #######################################
export const catCategoriasProductos = createTable("categorias_productos", { 
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  categoria: varchar("categoria", { length: 30 }).notNull(),
});

export const catEstados = createTable("estados", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  estado: varchar("estado", { length: 20 }).notNull(),
});

export const catCategoriaPersonas = createTable("categoria_personas", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  categoria: varchar("categoria", { length: 30 }).notNull(),
});

export const catRoles = createTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  roles: varchar("roles", { length: 20 }).notNull(),
});

export const catMetodosPago = createTable("metodos_pago", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  metodoPago: varchar("metodo_pago", { length: 30 }).notNull(),
});

export const catTipoMovimientos = createTable("tipo_movimientos", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  movimiento: varchar("movimiento", { length: 12 }).notNull(),
});

export const catUbicaciones = createTable("ubicaciones", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  ubicacion: varchar("ubicacion", { length: 30 }).notNull(),
});

// T A B L A S #######################################
export const personas = createTable("personas", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  apellidoPaterno: varchar("apellido_paterno", { length: 30 }),
  apellidoMaterno: varchar("apellido_materno", { length: 30 }),
  rfc: varchar("rfc", { length: 10 }), //No es obligatorio tenerlo
  telefono: varchar("telefono", { length: 20 }).notNull(),
  email: varchar("email", { length: 32 }),
  estadosId: varchar("estados_id", { length: 36 }).references(() => catEstados.id).notNull(),
  categoriaPersonasId: varchar("categoria_personas_id", { length: 36 })
    .references(() => catCategoriaPersonas.id)
    .notNull(),
});

export const productos = createTable("productos", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  categoriasProductosId: varchar("categorias_productos_id", { length: 36 })
    .references(() => catCategoriasProductos.id)
    .notNull(),
  proveedorId: varchar("proveedor_id", { length: 36 }).references(() => personas.id).notNull(),
  estadosId: varchar("estados_id", { length: 36 }).references(() => catEstados.id).notNull(),
});

export const historialPrecios = createTable("historial_precios", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  productosId: varchar("productos_id", { length: 36 }).references(() => productos.id).notNull(),
  precio: integer("precio").notNull(),
  fechaDeRegistro: timestamp("fecha_de_registro", { withTimezone: true }).notNull(),
});

export const historialCostos = createTable("historial_costos", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  productosId: varchar("productos_id", { length: 36 }).references(() => productos.id).notNull(),
  costo: integer("costo").notNull(),
  fechaDeRegistro: timestamp("fecha_de_registro", { withTimezone: true }).notNull(),
});

export const usuarios = createTable("usuarios", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  nombre: varchar("nombre", { length: 30 }).notNull(),
  contrasena: varchar("contrasena", { length: 32 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull(),
  rolesId: varchar("roles_id", { length: 36 }).references(() => catRoles.id).notNull(),
  estadosId: varchar("estados_id", { length: 36 }).references(() => catEstados.id).notNull(),
});

export const ordenesDeVentas = createTable("ordenes_de_ventas", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  personasId: varchar("personas_id", { length: 36 }).references(() => personas.id).notNull(),
  fechaOrden: timestamp("fecha_orden", { withTimezone: true }).notNull(),
  usuariosId: varchar("usuarios_id", { length: 36 }).references(() => usuarios.id).notNull(),
  totalVenta: integer("total_venta").notNull(),
});

export const detallesOrdenesDeVentas = createTable("detalles_ordenes_de_ventas", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  ordenesDeVentasId: varchar("ordenes_de_ventas_id", { length: 36 })
    .references(() => ordenesDeVentas.id)
    .notNull(),
  productosId: varchar("productos_id", { length: 36 }).references(() => productos.id).notNull(),
  historialPreciosId: varchar("historial_precios_id", { length: 36 })
    .references(() => historialPrecios.id)
    .notNull(),
  cantidad: integer("cantidad").notNull(),
  totalVenta: integer("total_venta").notNull(),
  metodosPagoId: varchar("metodos_pago_id", { length: 36 }).references(() => catMetodosPago.id).notNull(),
});

export const historialPagosClientes = createTable("historial_pagos_clientes", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  personasId: varchar("personas_id", { length: 36 }).references(() => personas.id).notNull(),
  montoPagado: integer("monto_pagado").notNull(),
  fecha: timestamp("fecha", { withTimezone: true }).notNull(),
  metodosPagoId: varchar("metodos_pago_id", { length: 36 }).references(() => catMetodosPago.id).notNull(),
});

export const ordenesDeCompras = createTable("ordenes_de_compras", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  personaId: varchar("persona_id", { length: 36 }).references(() => personas.id).notNull(),
  fechaOrden: timestamp("fecha_orden", { withTimezone: true }).notNull(),
  estadosId: varchar("estados_id", { length: 36 }).references(() => catEstados.id).notNull(),
});

export const detallesOrdenesDeCompras = createTable("detalles_ordenes_de_compras", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  ordenesDeComprasId: varchar("ordenes_de_compras_id", { length: 36 })
    .references(() => ordenesDeCompras.id)
    .notNull(),
  productoId: varchar("producto_id", { length: 36 }).references(() => productos.id).notNull(),
  cantidad: integer("cantidad").notNull(),
  historialCostosId: varchar("historial_costos_id", { length: 36 })
    .references(() => historialCostos.id)
    .notNull(),
});

export const historialCargosProveedores = createTable("historial_cargos_proveedores", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  personasId: varchar("personas_id", { length: 36 }).references(() => personas.id).notNull(),
  montoPagado: integer("monto_pagado").notNull(),
  fecha: timestamp("fecha", { withTimezone: true }).notNull(),
  metodosPagoId: varchar("metodos_pago_id", { length: 36 }).references(() => catMetodosPago.id).notNull(),
});

export const inventarios = createTable("inventarios", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  productosId: varchar("productos_id", { length: 36 }).references(() => productos.id).notNull(),
  ubicacionesId: varchar("ubicaciones_id", { length: 36 }).references(() => catUbicaciones.id).notNull(),
  cantidadDisponible: integer("cantidad_disponible").notNull(),
  cantidadMinima: integer("cantidad_minima").notNull(),
  cantidadMaxima: integer("cantidad_maxima").notNull(),
});

export const movimientosInventarios = createTable("movimientos_inventarios", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  productosId: varchar("productos_id", { length: 36 }).references(() => productos.id).notNull(),
  ubicacionesId: varchar("ubicaciones_id", { length: 36 }).references(() => catUbicaciones.id).notNull(),
  tipoMovimientosId: varchar("tipo_movimientos_id", { length: 36 })
    .references(() => catTipoMovimientos.id)
    .notNull(),
  cantidad: integer("cantidad").notNull(),
  fechaMovimiento: timestamp("fecha_movimiento", { withTimezone: true }).notNull(),
  usuariosId: varchar("usuarios_id", { length: 36 }).references(() => usuarios.id).notNull(),
  claveMovimiento: varchar("clave_movimiento", { length: 30 }).notNull(),
});

// Para calcular cuanto se reduce de un producto padre al vender un producto hijo
export const composicionProductos = createTable("composicion_productos", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  productoPadreId: varchar("producto_padre_id", { length: 36 })
    .references(() => productos.id)
    .notNull(),
  productoHijoId: varchar("producto_hijo_id", { length: 36 })
    .references(() => productos.id)
    .notNull(),
  cantidadNecesaria: integer("cantidad_necesaria").notNull(),
  unidadMedidaHijo: varchar("unidad_medida_hijo", { length: 50 }).notNull(),
});


// V E R I F I C A C I O N E S #######################################
//Para la autenticación de Auth
export const nextAuthUsers = createTable("next_auth_users", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: varchar("name", { length: 30 }),
  email: varchar("email", { length: 50 }).notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: varchar("image", { length: 255 }),
});

// Tabla para almacenar cuentas de usuario vinculadas a proveedores de autenticación
export const accounts = createTable("accounts", {
  userId: varchar("user_id", { length: 255 }).notNull(), // Relación con la tabla de usuarios
  type: varchar("type", { length: 255 }).notNull(), // Tipo de cuenta (ej. "oauth")
  provider: varchar("provider", { length: 255 }).notNull(), // Nombre del proveedor (ej. "discord")
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(), // ID único del proveedor
  refresh_token: text("refresh_token"), // Token de actualización (opcional)
  access_token: text("access_token"), // Token de acceso (opcional)
  expires_at: integer("expires_at"), // Fecha de expiración del token (opcional)
  token_type: varchar("token_type", { length: 255 }), // Tipo de token (opcional)
  scope: varchar("scope", { length: 255 }), // Alcance del token (opcional)
  id_token: text("id_token"), // ID token (opcional)
  session_state: varchar("session_state", { length: 255 }), // Estado de la sesión (opcional)
}, (table) => ({
  compositePk: primaryKey(table.provider, table.providerAccountId), // Clave primaria compuesta
}));

// Tabla para almacenar sesiones activas de los usuarios
export const sessions = createTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey().notNull(), // Token de sesión único y clave primaria
  userId: varchar("user_id", { length: 255 }).notNull(), // Relación con la tabla de usuarios
  expires: timestamp("expires", { withTimezone: true }).notNull(), // Fecha de expiración de la sesión
});

// Tabla para almacenar tokens de verificación (ej. para recuperación de contraseña)
export const verificationTokens = createTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(), // Identificador único (ej. email)
  token: varchar("token", { length: 255 }).notNull(), // Token de verificación
  expires: timestamp("expires", { withTimezone: true }).notNull(), // Fecha de expiración del token
}, (table) => ({
  compositePk: primaryKey(table.identifier, table.token), // Clave primaria compuesta
}));

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => nextAuthUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true })
  });


  // R E L A C I O N E S #######################################
  // Relaciones para catálogos
export const catCategoriasProductosRelations = relations(catCategoriasProductos, ({ many }) => ({
  productos: many(productos)
}));

export const catEstadosRelations = relations(catEstados, ({ many }) => ({
  personas: many(personas),
  productos: many(productos),
  usuarios: many(usuarios),
  ordenesDeCompras: many(ordenesDeCompras)
}));

export const catCategoriaPersonasRelations = relations(catCategoriaPersonas, ({ many }) => ({
  personas: many(personas)
}));

export const catRolesRelations = relations(catRoles, ({ many }) => ({
  usuarios: many(usuarios)
}));

export const catMetodosPagoRelations = relations(catMetodosPago, ({ many }) => ({
  detallesOrdenesDeVentas: many(detallesOrdenesDeVentas),
  historialPagosClientes: many(historialPagosClientes),
  historialCargosProveedores: many(historialCargosProveedores)
}));

export const catTipoMovimientosRelations = relations(catTipoMovimientos, ({ many }) => ({
  movimientosInventarios: many(movimientosInventarios)
}));

export const catUbicacionesRelations = relations(catUbicaciones, ({ many }) => ({
  inventarios: many(inventarios),
  movimientosInventarios: many(movimientosInventarios)
}));

// Relaciones para personas
export const personasRelations = relations(personas, ({ one, many }) => ({
  estado: one(catEstados, {
    fields: [personas.estadosId],
    references: [catEstados.id]
  }),
  categoriaPersona: one(catCategoriaPersonas, {
    fields: [personas.categoriaPersonasId],
    references: [catCategoriaPersonas.id]
  }),
  productosProveidos: many(productos),
  ordenesDeVentas: many(ordenesDeVentas),
  ordenesDeCompras: many(ordenesDeCompras),
  historialPagosClientes: many(historialPagosClientes),
  historialCargosProveedores: many(historialCargosProveedores)
}));

// Relaciones para productos
export const productosRelations = relations(productos, ({ one, many }) => ({
  categoriaProducto: one(catCategoriasProductos, {
    fields: [productos.categoriasProductosId],
    references: [catCategoriasProductos.id]
  }),
  proveedor: one(personas, {
    fields: [productos.proveedorId],
    references: [personas.id]
  }),
  estado: one(catEstados, {
    fields: [productos.estadosId],
    references: [catEstados.id]
  }),
  historialPrecios: many(historialPrecios),
  historialCostos: many(historialCostos),
  detallesOrdenesDeVentas: many(detallesOrdenesDeVentas),
  detallesOrdenesDeCompras: many(detallesOrdenesDeCompras),
  inventarios: many(inventarios),
  movimientosInventarios: many(movimientosInventarios),
  composicionesComoPadre: many(composicionProductos, { relationName: "productoPadre" }),
  composicionesComoHijo: many(composicionProductos, { relationName: "productoHijo" })
}));

// Relaciones para historiales de precios y costos
export const historialPreciosRelations = relations(historialPrecios, ({ one, many }) => ({
  producto: one(productos, {
    fields: [historialPrecios.productosId],
    references: [productos.id]
  }),
  detallesOrdenesDeVentas: many(detallesOrdenesDeVentas)
}));

export const historialCostosRelations = relations(historialCostos, ({ one, many }) => ({
  producto: one(productos, {
    fields: [historialCostos.productosId],
    references: [productos.id]
  }),
  detallesOrdenesDeCompras: many(detallesOrdenesDeCompras)
}));

// Relaciones para usuarios
export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  rol: one(catRoles, {
    fields: [usuarios.rolesId],
    references: [catRoles.id]
  }),
  estado: one(catEstados, {
    fields: [usuarios.estadosId],
    references: [catEstados.id]
  }),
  ordenesDeVentas: many(ordenesDeVentas),
  movimientosInventarios: many(movimientosInventarios)
}));

// Relaciones para órdenes de ventas
export const ordenesDeVentasRelations = relations(ordenesDeVentas, ({ one, many }) => ({
  cliente: one(personas, {
    fields: [ordenesDeVentas.personasId],
    references: [personas.id]
  }),
  usuario: one(usuarios, {
    fields: [ordenesDeVentas.usuariosId],
    references: [usuarios.id]
  }),
  detalles: many(detallesOrdenesDeVentas)
}));

// Relaciones para detalles de órdenes de ventas
export const detallesOrdenesDeVentasRelations = relations(detallesOrdenesDeVentas, ({ one }) => ({
  ordenVenta: one(ordenesDeVentas, {
    fields: [detallesOrdenesDeVentas.ordenesDeVentasId],
    references: [ordenesDeVentas.id]
  }),
  producto: one(productos, {
    fields: [detallesOrdenesDeVentas.productosId],
    references: [productos.id]
  }),
  historialPrecio: one(historialPrecios, {
    fields: [detallesOrdenesDeVentas.historialPreciosId],
    references: [historialPrecios.id]
  }),
  metodoPago: one(catMetodosPago, {
    fields: [detallesOrdenesDeVentas.metodosPagoId],
    references: [catMetodosPago.id]
  })
}));

// Relaciones para historial de pagos de clientes
export const historialPagosClientesRelations = relations(historialPagosClientes, ({ one }) => ({
  cliente: one(personas, {
    fields: [historialPagosClientes.personasId],
    references: [personas.id]
  }),
  metodoPago: one(catMetodosPago, {
    fields: [historialPagosClientes.metodosPagoId],
    references: [catMetodosPago.id]
  })
}));

// Relaciones para órdenes de compras
export const ordenesDeComprasRelations = relations(ordenesDeCompras, ({ one, many }) => ({
  proveedor: one(personas, {
    fields: [ordenesDeCompras.personaId],
    references: [personas.id]
  }),
  estado: one(catEstados, {
    fields: [ordenesDeCompras.estadosId],
    references: [catEstados.id]
  }),
  detalles: many(detallesOrdenesDeCompras)
}));

// Relaciones para detalles de órdenes de compras
export const detallesOrdenesDeComprasRelations = relations(detallesOrdenesDeCompras, ({ one }) => ({
  ordenCompra: one(ordenesDeCompras, {
    fields: [detallesOrdenesDeCompras.ordenesDeComprasId],
    references: [ordenesDeCompras.id]
  }),
  producto: one(productos, {
    fields: [detallesOrdenesDeCompras.productoId],
    references: [productos.id]
  }),
  historialCosto: one(historialCostos, {
    fields: [detallesOrdenesDeCompras.historialCostosId],
    references: [historialCostos.id]
  })
}));

// Relaciones para historial de cargos a proveedores
export const historialCargosProveedoresRelations = relations(historialCargosProveedores, ({ one }) => ({
  proveedor: one(personas, {
    fields: [historialCargosProveedores.personasId],
    references: [personas.id]
  }),
  metodoPago: one(catMetodosPago, {
    fields: [historialCargosProveedores.metodosPagoId],
    references: [catMetodosPago.id]
  })
}));

// Relaciones para inventarios
export const inventariosRelations = relations(inventarios, ({ one }) => ({
  producto: one(productos, {
    fields: [inventarios.productosId],
    references: [productos.id]
  }),
  ubicacion: one(catUbicaciones, {
    fields: [inventarios.ubicacionesId],
    references: [catUbicaciones.id]
  })
}));

// Relaciones para movimientos de inventarios
export const movimientosInventariosRelations = relations(movimientosInventarios, ({ one }) => ({
  producto: one(productos, {
    fields: [movimientosInventarios.productosId],
    references: [productos.id]
  }),
  ubicacion: one(catUbicaciones, {
    fields: [movimientosInventarios.ubicacionesId],
    references: [catUbicaciones.id]
  }),
  tipoMovimiento: one(catTipoMovimientos, {
    fields: [movimientosInventarios.tipoMovimientosId],
    references: [catTipoMovimientos.id]
  }),
  usuario: one(usuarios, {
    fields: [movimientosInventarios.usuariosId],
    references: [usuarios.id]
  })
}));

// Relaciones para composición de productos
export const composicionProductosRelations = relations(composicionProductos, ({ one }) => ({
  productoPadre: one(productos, {
    fields: [composicionProductos.productoPadreId],
    references: [productos.id],
    relationName: "productoPadre"
  }),
  productoHijo: one(productos, {
    fields: [composicionProductos.productoHijoId],
    references: [productos.id],
    relationName: "productoHijo"
  })
}));

// Relaciones para Auth.js
export const nextAuthUsersRelations = relations(nextAuthUsers, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  posts: many(posts)
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(nextAuthUsers, {
    fields: [accounts.userId],
    references: [nextAuthUsers.id]
  })
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(nextAuthUsers, {
    fields: [sessions.userId],
    references: [nextAuthUsers.id]
  })
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(nextAuthUsers, {
    fields: [posts.createdById],
    references: [nextAuthUsers.id]
  })
}));