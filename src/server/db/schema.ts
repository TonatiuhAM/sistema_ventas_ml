import { relations, sql } from "drizzle-orm";
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
  apellidoPaterno: varchar("apellido_paterno", { length: 30 }).notNull(),
  apellidoMaterno: varchar("apellido_materno", { length: 30 }).notNull(),
  rfc: varchar("rfc", { length: 10 }).notNull(),
  telefono: varchar("telefono", { length: 20 }).notNull(),
  email: varchar("email", { length: 32 }).notNull(),
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