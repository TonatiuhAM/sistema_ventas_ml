import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { 
  catCategoriasProductos, 
  catEstados,
  catCategoriaPersonas,
  catRoles,
  catMetodosPago,
  catTipoMovimientos,
  catUbicaciones
} from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Esquema genérico para crear/actualizar un catálogo
const catalogSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(1).max(30),
});

export const catalogsRouter = createTRPCRouter({
  // ===== CATEGORÍAS DE PRODUCTOS =====
  getCategoriasProductos: publicProcedure.query(async () => {
    return await db.select().from(catCategoriasProductos);
  }),

  createCategoriaProducto: publicProcedure
    .input(z.object({ categoria: z.string().min(1).max(30) }))
    .mutation(async ({ input }) => {
      const id = uuidv4();
      return await db.insert(catCategoriasProductos).values({
        id,
        categoria: input.categoria,
      }).returning();
    }),

  updateCategoriaProducto: publicProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      categoria: z.string().min(1).max(30) 
    }))
    .mutation(async ({ input }) => {
      return await db.update(catCategoriasProductos)
        .set({ categoria: input.categoria })
        .where(eq(catCategoriasProductos.id, input.id))
        .returning();
    }),

  deleteCategoriaProducto: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await db.delete(catCategoriasProductos)
        .where(eq(catCategoriasProductos.id, input.id))
        .returning();
    }),

  // ===== ESTADOS =====
  getEstados: publicProcedure.query(async () => {
    return await db.select().from(catEstados);
  }),

  createEstado: publicProcedure
    .input(z.object({ estado: z.string().min(1).max(20) }))
    .mutation(async ({ input }) => {
      const id = uuidv4();
      return await db.insert(catEstados).values({
        id,
        estado: input.estado,
      }).returning();
    }),

  updateEstado: publicProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      estado: z.string().min(1).max(20) 
    }))
    .mutation(async ({ input }) => {
      return await db.update(catEstados)
        .set({ estado: input.estado })
        .where(eq(catEstados.id, input.id))
        .returning();
    }),

  deleteEstado: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await db.delete(catEstados)
        .where(eq(catEstados.id, input.id))
        .returning();
    }),

  // ===== CATEGORÍAS DE PERSONAS =====
  getCategoriasPersonas: publicProcedure.query(async () => {
    return await db.select().from(catCategoriaPersonas);
  }),

  createCategoriaPersona: publicProcedure
    .input(z.object({ categoria: z.string().min(1).max(30) }))
    .mutation(async ({ input }) => {
      const id = uuidv4();
      return await db.insert(catCategoriaPersonas).values({
        id,
        categoria: input.categoria,
      }).returning();
    }),

  updateCategoriaPersona: publicProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      categoria: z.string().min(1).max(30) 
    }))
    .mutation(async ({ input }) => {
      return await db.update(catCategoriaPersonas)
        .set({ categoria: input.categoria })
        .where(eq(catCategoriaPersonas.id, input.id))
        .returning();
    }),

  deleteCategoriaPersona: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await db.delete(catCategoriaPersonas)
        .where(eq(catCategoriaPersonas.id, input.id))
        .returning();
    }),

  // ===== ROLES =====
  getRoles: publicProcedure.query(async () => {
    return await db.select().from(catRoles);
  }),

  createRol: publicProcedure
    .input(z.object({ roles: z.string().min(1).max(20) }))
    .mutation(async ({ input }) => {
      const id = uuidv4();
      return await db.insert(catRoles).values({
        id,
        roles: input.roles,
      }).returning();
    }),

  updateRol: publicProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      roles: z.string().min(1).max(20) 
    }))
    .mutation(async ({ input }) => {
      return await db.update(catRoles)
        .set({ roles: input.roles })
        .where(eq(catRoles.id, input.id))
        .returning();
    }),

  deleteRol: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await db.delete(catRoles)
        .where(eq(catRoles.id, input.id))
        .returning();
    }),

  // ===== MÉTODOS DE PAGO =====
  getMetodosPago: publicProcedure.query(async () => {
    return await db.select().from(catMetodosPago);
  }),

  createMetodoPago: publicProcedure
    .input(z.object({ metodoPago: z.string().min(1).max(30) }))
    .mutation(async ({ input }) => {
      const id = uuidv4();
      return await db.insert(catMetodosPago).values({
        id,
        metodoPago: input.metodoPago,
      }).returning();
    }),

  updateMetodoPago: publicProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      metodoPago: z.string().min(1).max(30) 
    }))
    .mutation(async ({ input }) => {
      return await db.update(catMetodosPago)
        .set({ metodoPago: input.metodoPago })
        .where(eq(catMetodosPago.id, input.id))
        .returning();
    }),

  deleteMetodoPago: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await db.delete(catMetodosPago)
        .where(eq(catMetodosPago.id, input.id))
        .returning();
    }),

  // ===== TIPOS DE MOVIMIENTOS =====
  getTipoMovimientos: publicProcedure.query(async () => {
    return await db.select().from(catTipoMovimientos);
  }),

  createTipoMovimiento: publicProcedure
    .input(z.object({ movimiento: z.string().min(1).max(12) }))
    .mutation(async ({ input }) => {
      const id = uuidv4();
      return await db.insert(catTipoMovimientos).values({
        id,
        movimiento: input.movimiento,
      }).returning();
    }),

  updateTipoMovimiento: publicProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      movimiento: z.string().min(1).max(12) 
    }))
    .mutation(async ({ input }) => {
      return await db.update(catTipoMovimientos)
        .set({ movimiento: input.movimiento })
        .where(eq(catTipoMovimientos.id, input.id))
        .returning();
    }),

  deleteTipoMovimiento: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await db.delete(catTipoMovimientos)
        .where(eq(catTipoMovimientos.id, input.id))
        .returning();
    }),

  // ===== UBICACIONES =====
  getUbicaciones: publicProcedure.query(async () => {
    return await db.select().from(catUbicaciones);
  }),

  createUbicacion: publicProcedure
    .input(z.object({ 
      nombre: z.string().min(1).max(30),
      ubicacion: z.string().min(1).max(30)
    }))
    .mutation(async ({ input }) => {
      const id = uuidv4();
      return await db.insert(catUbicaciones).values({
        id,
        nombre: input.nombre,
        ubicacion: input.ubicacion,
      }).returning();
    }),

  updateUbicacion: publicProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      nombre: z.string().min(1).max(30).optional(),
      ubicacion: z.string().min(1).max(30).optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return await db.update(catUbicaciones)
        .set(updateData)
        .where(eq(catUbicaciones.id, id))
        .returning();
    }),

  deleteUbicacion: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await db.delete(catUbicaciones)
        .where(eq(catUbicaciones.id, input.id))
        .returning();
    }),
});