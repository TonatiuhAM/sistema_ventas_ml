import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { personas, catEstados, catCategoriaPersonas } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const personasRouter = createTRPCRouter({
  // Obtener todas las personas
  getAll: publicProcedure.query(async () => {
    return await db
      .select({
        id: personas.id,
        nombre: personas.nombre,
        apellidoPaterno: personas.apellidoPaterno,
        apellidoMaterno: personas.apellidoMaterno,
        rfc: personas.rfc,
        telefono: personas.telefono,
        email: personas.email,
        estado: catEstados.estado,
        estadosId: personas.estadosId,
        categoria: catCategoriaPersonas.categoria,
        categoriaPersonasId: personas.categoriaPersonasId,
      })
      .from(personas)
      .leftJoin(catEstados, eq(personas.estadosId, catEstados.id))
      .leftJoin(catCategoriaPersonas, eq(personas.categoriaPersonasId, catCategoriaPersonas.id));
  }),

  // Crear una nueva persona
  create: publicProcedure
    .input(
      z.object({
        nombre: z.string().min(1).max(30),
        apellidoPaterno: z.string().max(30).optional(),
        apellidoMaterno: z.string().max(30).optional(),
        rfc: z.string().max(10).optional(),
        telefono: z.string().min(1).max(20),
        email: z.string().email().max(32).optional(),
        estadosId: z.string().uuid(),
        categoriaPersonasId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuidv4();
      return await db.insert(personas).values({
        id,
        ...input,
      }).returning();
    }),

  // Actualizar una persona existente
  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        nombre: z.string().min(1).max(30).optional(),
        apellidoPaterno: z.string().max(30).optional(),
        apellidoMaterno: z.string().max(30).optional(),
        rfc: z.string().max(10).optional(),
        telefono: z.string().min(1).max(20).optional(),
        email: z.string().email().max(32).optional(),
        estadosId: z.string().uuid().optional(),
        categoriaPersonasId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.update(personas).set(data).where(eq(personas.id, id)).returning();
    }),

  // Eliminar una persona
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await db.delete(personas).where(eq(personas.id, input.id)).returning();
    }),
    
  // Obtener una persona por ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(personas)
        .where(eq(personas.id, input.id))
        .limit(1);
        
      return result.length ? result[0] : null;
    }),
});