import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { 
  usuarios, 
  nextAuthUsers, 
  catRoles, 
  catEstados 
} from "~/server/db/schema";

// Esquema de validación para crear usuario
const createUsuarioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmarContrasena: z.string(),
  telefono: z.string().min(10, "Ingresa un número de teléfono válido"),
  rolesId: z.string().uuid("Selecciona un rol válido"),
  estadosId: z.string().uuid("Selecciona un estado válido"),
}).refine(data => data.contrasena === data.confirmarContrasena, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarContrasena"]
});

export const usuariosRouter = createTRPCRouter({
  // IMPORTANTE: Temporalmente usamos publicProcedure para permitir la creación del primer usuario
  // Obtener todos los usuarios
  getAll: protectedProcedure // Cambiado de protectedProcedure a publicProcedure temporalmente
    .query(async ({ ctx }) => {
      return ctx.db.query.usuarios.findMany({
        with: {
          rol: true,
          estado: true
        },
      });
    }),

  // Obtener un usuario por id
  getById: publicProcedure // Cambiado de protectedProcedure a publicProcedure temporalmente
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const usuario = await ctx.db.query.usuarios.findFirst({
        where: eq(usuarios.id, input.id),
        with: {
          rol: true,
          estado: true
        },
      });
      
      // Obtener también el email del usuario desde nextAuthUsers
      if (usuario) {
        const authUser = await ctx.db.query.nextAuthUsers.findFirst({
          where: eq(nextAuthUsers.id, input.id),
          columns: {
            email: true
          }
        });
        
        return {
          ...usuario,
          email: authUser?.email
        };
      }
      
      return null;
    }),

  // Crear un nuevo usuario
  create: publicProcedure // Cambiado de protectedProcedure a publicProcedure temporalmente
    .input(createUsuarioSchema)
    .mutation(async ({ ctx, input }) => {
      // Verificar si el email ya está en uso
      const existingUser = await ctx.db.query.nextAuthUsers.findFirst({
        where: (users) => eq(users.email, input.email)
      });

      if (existingUser) {
        throw new Error("El correo electrónico ya está registrado");
      }

      // Generar un nuevo ID para el usuario
      const userId = uuidv4();
      
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(input.contrasena, 10);
      
      // Crear el usuario en la tabla nextAuthUsers
      await ctx.db.insert(nextAuthUsers).values({
        id: userId,
        name: input.nombre,
        email: input.email,
      });

      // Crear el usuario en la tabla usuarios
      const nuevoUsuario = await ctx.db.insert(usuarios).values({
        id: userId,
        nombre: input.nombre,
        contrasena: hashedPassword,
        telefono: input.telefono,
        rolesId: input.rolesId,
        estadosId: input.estadosId,
      }).returning();

      return nuevoUsuario[0];
    }),

  // Actualizar un usuario
  update: publicProcedure // Cambiado de protectedProcedure a publicProcedure temporalmente
    .input(z.object({
      id: z.string().uuid(),
      nombre: z.string().min(3).optional(),
      email: z.string().email().optional(),
      telefono: z.string().min(10).optional(),
      rolesId: z.string().uuid().optional(),
      estadosId: z.string().uuid().optional(),
      contrasena: z.string().min(6).optional(),
      confirmarContrasena: z.string().optional(),
    }).refine(
      data => !data.contrasena || data.contrasena === data.confirmarContrasena,
      {
        message: "Las contraseñas no coinciden",
        path: ["confirmarContrasena"]
      }
    ))
    .mutation(async ({ ctx, input }) => {
      const { id, email, contrasena, confirmarContrasena, ...usuarioData } = input;
      
      // Actualizar información en nextAuthUsers si hay cambio de email
      if (email) {
        await ctx.db.update(nextAuthUsers)
          .set({ 
            email,
            name: usuarioData.nombre || undefined 
          })
          .where(eq(nextAuthUsers.id, id));
      } else if (usuarioData.nombre) {
        await ctx.db.update(nextAuthUsers)
          .set({ name: usuarioData.nombre })
          .where(eq(nextAuthUsers.id, id));
      }
      
      // Preparar los datos para actualizar usuario
      const datosActualizacion = {...usuarioData};
      
      // Actualizar contraseña si se proporciona
      if (contrasena) {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        // Crear un nuevo objeto para la actualización que incluya la contraseña
        Object.assign(datosActualizacion, { contrasena: hashedPassword });
      }
      
      // Actualizar el resto de la información del usuario
      if (Object.keys(datosActualizacion).length > 0) {
        return await ctx.db.update(usuarios)
          .set(datosActualizacion)
          .where(eq(usuarios.id, id))
          .returning();
      }
      
      return { id };
    }),

  // Eliminar un usuario
  delete: publicProcedure // Cambiado de protectedProcedure a publicProcedure temporalmente
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Eliminar de nextAuthUsers también eliminará automáticamente
      // registros relacionados en "usuarios" debido a la restricción de clave foránea
      await ctx.db.delete(nextAuthUsers)
        .where(eq(nextAuthUsers.id, input.id));
      
      return { id: input.id, deleted: true };
    }),

  // Obtener roles para select
  getRoles: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.query.catRoles.findMany();
    }),

  // Obtener estados para select
  getEstados: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.query.catEstados.findMany();
    }),

  // NOTA: Después de crear el primer usuario administrador, 
  // deberías cambiar todos los publicProcedure de arriba a protectedProcedure
  // para limitar el acceso solo a usuarios autenticados.
});