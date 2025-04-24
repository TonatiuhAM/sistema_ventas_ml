import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  nextAuthUsers,
  verificationTokens,
  usuarios
} from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string; // Añadido para roles de usuario
    } & DefaultSession["user"];
  }

  interface User {
    role?: string; // Añadido para roles de usuario
  }
}

// No se necesita extender el JWT explícitamente en módulo separado

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      // El nombre que se mostrará en el botón de inicio de sesión
      name: "Credenciales",
      // Las credenciales se usarán para generar un formulario adecuado en la página de inicio de sesión
      credentials: {
        email: { label: "Email", type: "email", placeholder: "ejemplo@mitienda.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Verificar que las credenciales existen
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          // Buscar el usuario en la tabla nextAuthUsers por email
          const userEmail = credentials.email as string;
          const user = await db.query.nextAuthUsers.findFirst({
            where: (users) => eq(users.email, userEmail)
          });

          // Si no existe el usuario, retornar null
          if (!user) {
            return null;
          }

          // Buscar el usuario correspondiente en la tabla usuarios
          const userInfo = await db.query.usuarios.findFirst({
            where: (u) => eq(u.id, user.id),
            with: {
              rol: true
            }
          });

          // Si no existe o no tiene contraseña, retornar null
          if (!userInfo?.contrasena) {
            return null;
          }

          // Verificar la contraseña
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            userInfo.contrasena
          );

          // Si la contraseña no es válida, retornar null
          if (!isPasswordValid) {
            return null;
          }

          // Retornar el usuario con rol incluido
          return {
            id: user.id,
            name: user.name || userInfo.nombre,
            email: user.email,
            role: userInfo.rol.roles,
            image: user.image
          };
        } catch (error) {
          console.error("Error de autenticación:", error);
          return null;
        }
      }
    }),
    DiscordProvider,
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: nextAuthUsers,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt", // Usar JWT para la estrategia de sesión
    maxAge: 8 * 60 * 60, // 8 horas en segundos
  },
  // Configuración para la duración de los tokens JWT
  jwt: {
    maxAge: 8 * 60 * 60, // 8 horas en segundos
  },
  callbacks: {
    // Corregir tipos para el callback de sesión
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        // @ts-expect-error - `role` no existe en el tipo User por defecto
        session.user.role = token.role;
      }
      return session;
    },
    // Corregir tipos para el callback de JWT
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login', // Página personalizada de inicio de sesión
  }
} satisfies NextAuthConfig;
