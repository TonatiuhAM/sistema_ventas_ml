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



export const productos = createTable("productos", {
  id: integer("id_productos").primaryKey().generatedByDefaultAsIdentity(),
  nombre: varchar("nombre", { length: 255 }),
  categoriasId: integer("categorias_id")
  .references(() => categorias.id),
  personas_id: integer("personas_id")
  .references(() => personas.id),
});

export const historialPrecios = createTable("historial_precios", {
  id: integer("id_historial_precios").primaryKey().generatedByDefaultAsIdentity(),
  productoId: integer("producto_id")
  .references(() => productos.id),
  precio: integer("precio"),
  fechaDeRegistro: timestamp("fecha_de_registro", { withTimezone: true })
  .default(sql`CURRENT_TIMESTAMP`)
  .notNull(),
});

export const historialCostos = createTable("historial_costos", {
  id: integer("id_historial_costos").primaryKey().generatedByDefaultAsIdentity(),
  productoId: integer("producto_id")
  .references(() => productos.id),
  costo: integer("costo"),
  fechaDeRegistro: timestamp("fecha_de_registro", { withTimezone: true })
  .default(sql`CURRENT_TIMESTAMP`)
  .notNull(),
});

export const categorias = createTable("categorias", {
  id: integer("id_categorias").primaryKey().generatedByDefaultAsIdentity(),
  categoria: varchar("categoria", { length: 255 }),
});

export const personas = createTable("personas", {
  id: integer("id_personas").primaryKey().generatedByDefaultAsIdentity(),
  nombre: varchar("nombre", { length: 255 }),
  apellidoPaterno: varchar("apellido_paterno", { length: 255 }),
  apellidoMaterno: varchar("apellido_materno", { length: 255 }),
  telefono: varchar("telefono", { length: 255 }),
  email: varchar("email", { length: 255 }),
  rfc: varchar("rfc", { length: 255 }),
  estadoID: integer("estado_id")
  .references(() => estados.id),
  categoriaPersonaId: varchar("categoria_persona_id", { length: 255 })
  .references(() => categoriasPersonas.id),
});

export const estados = createTable("estados", {
  id: integer("id_estados").primaryKey().generatedByDefaultAsIdentity(),
  estado: varchar("estado", { length: 255 }),
});

export const categoriasPersonas = createTable("categorias_personas", {
  id: integer("id_categorias_personas").primaryKey().generatedByDefaultAsIdentity(),
  categoria: varchar("categoria", { length: 255 })
});

export const categoriasPersonasRelations = relations(categoriasPersonas, ({ many }) => ({
  personas: many(personas),
}));

export const ordenesDeVentas = createTable("ordenes_de_ventas", {
  id: integer("id_ordenes_de_ventas").primaryKey().generatedByDefaultAsIdentity(),
  personasId: integer("personas_id")
  .references(() => personas.id),
  fechaDeOrden: timestamp("fecha_de_orden", { withTimezone: true })
  .default(sql`CURRENT_TIMESTAMP`)
  .notNull(),
  usuariosId: varchar("usuarios_id", { length: 255 })
  .references(() => usuarios.id),
  total: integer("total")
});

export const DetallesOrdenesDeVentas = createTable("detalles_ordenes_de_ventas", {
  id: integer("id_detalles_ordenes_de_ventas").primaryKey().generatedByDefaultAsIdentity(),
  ordenesDeVentasId: integer("ordenes_de_ventas_id")
  .references(() => ordenesDeVentas.id),
  productosId: integer("productos_id")
  .references(() => productos.id),
  historialPrecioProductoId: integer("historial_precio_producto_id")
  .references(() => historialPrecios.id),
  cantidad: integer("cantidad")
});

export const usuarios = createTable("usuarios", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nombre: varchar("nombre", { length: 255 }),
  contraseña: varchar("contraseña", { length: 255 }),
  telefono: varchar("telefono", { length: 255 }),
  rolesId: integer("roles_id")
  .references(() => roles.id),
  estadosId: integer("estados_id")
  .references(() => estados.id)
});

export const roles = createTable("roles", {
  id: integer("id_roles").primaryKey().generatedByDefaultAsIdentity(),
  rol: varchar("rol", { length: 255 })
});

export const rolesRelations = relations(roles, ({ many }) => ({
  usuarios: many(usuarios),
}));

export const historialCargosProveedores = createTable(hisotrial_cargos_proveedores, {
  id_historial_cargos_proveedores: integer("id_historial_cargos_proveedores")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  id_personas: integer("personas_id")
    .notNull()
    .references(() => personas.id_personas),
    monto_pagado: integer("monto_pagado")
    fechadepago: timestamp("fechadepago", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
      metodopago: varchar("metodopago", { length: 255 })
      .notNull()
      .references(() => metodos_pago.id_metodos_pago),
} );

export const ordenesdecompras = createTable(ordenes_de_compras, {
  id_ordenes_de_compras: integer("id_ordenes_de_compras")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
    personas_id: integer("personas_id")
    .notNull()
    .references(() => personas.id_categorias_personas),
    fechaorden: timestamp("fecha_orden", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
    estado: varchar("estado", { length: 255 })
    .notNull()
    .references(() => estados.id_estados),
});

export const detalles_ordenes_de_compras = createTable(detalles_ordenes_compras, {
  id_detalles_ordenes_compras: integer("id_detalles_ordenes_de_compras")
  .notNull()
  .primaryKey()
  .generatedByDefaultAsIdentity(),
  orden_compra_id: integer("orden_compra_id")
  .notNull()
  .references(() => ordenes_de_compras.id_orden_compra),
  productos_id: integer("producto_id")
  .notNull()
  .references(() => productos.id_productos),
  .cantidad: integer("cantidad")  
  .notNull()
  .references(() => productos.cantidad),
  .precio: integer("precio_unitario")
  .notNull()
  .references(() => productos.precio_unitario),
]);

export const historialpagosclientes = createTable(historial_pagos_clientes, {
  id_historial_pagos_clientes: integer("id_historial_pagos_clientes")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  id_personas: integer("personas_id")
    .notNull()
    .references(() => personas.id_personas),  
  monto_pagado: integer("monto_pagado")
  .notNull()
  .references(() => personas.monto_pagado),   
  fechadepago: timestamp("fecha_de_pago", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
    .metodopago: varchar("metodo_pago", { length: 255 })
    .notNull()
    .references(() => metodos_pago.id_metodos_pago),
]);

export const metodos_pagos = createTable(metodos_pago, {
  id_metodos_pago: integer("id_metodos_pagos")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
    formadepago: varchar("forma_de_pago", { length: 255 })
    .notNull()
    .references(() => metodos_pago.forma_de_pago),
]);

export const estados = createTable(estados, {
  id_estados: integer("id_estados")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  estado: varchar("estado", { length: 255 })
    .notNull()
    .references(() => estados.nombre_estado),
});

export roles = createTable(roles, {
  id_roles: integer("id_roles")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
    rol: varchar("rol", { length: 255 })
    .notNull()
]);

inventarios = createTable(inventarios, {
  id_inventario: integer("id_inventario")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  id_productos: integer("productos_id")
    .notNull()
    .references(() => productos.id_producto),
    ubicacionid: integer("ubicacion_id")
    .notNull()
    .references(() => ubicaciones.id_ubicaciones),
    cantidaddisponible: integer("cantidad_disponible")
    .notNull()
    cantidadminima: integer("cantidad_minima")
    .notNull()
    cantidadmaxima: integer("cantidad_maxima")
    .notNull()
});

export const ubicaciones = createTable(ubicaciones, {
  id_ubicaciones: integer("id_ubicaciones")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  nombre: varchar("nombre", { length: 255 })
    .notNull()
  ubicacion: varchar("ubicacion", { length: 255 })
    .notNull()
});

export movimientosinventarios = createTable(movimientos_inventarios, {
  id_movimientos_inventarios: integer("id_movimientos_inventario")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
productoid : integer("producto_id")
    .notNull()
    .references(() => productos.id_producto),
ubiacacion_id: integer("ubicacion_id")
    .notNull()
    .references(() => ubicaciones.id_ubicaciones),  
  cantidad: integer("cantidad")
    .notNull()
  fechamovimiento: timestamp("fecha_movimiento", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  usuarioid : integer("usuario_id")
    .notNull()
    .references(() => users.id),
    tipo_orden : varchar("tipo_orden", { length: 255 })
    .notNull()

});

export const tipos_movimientos = createTable(tipos_movimientos, {
  id_tipos_movimientos: integer("id_tipos_movimientos")
    .notNull()
    .primaryKey()
    .generatedByDefaultAsIdentity(),
    tipo  : varchar("tipo", { length: 255 })
    .notNull()
});

/*
export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
*/