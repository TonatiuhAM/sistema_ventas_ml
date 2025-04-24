"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type ModuleType = 
  | "usuarios" 
  | "catalogs" 
  | "inventory" 
  | "personas" 
  | "pos";

// Definir los permisos por rol
const rolePermissions: Record<string, ModuleType[]> = {
  // El administrador puede acceder a todo
  "Administrador": ["usuarios", "catalogs", "inventory", "personas", "pos"],
  // El empleado solo puede acceder al punto de venta
  "Empleado": ["pos"],
  // Agregar más roles según sea necesario
};

export function useRolePermissions(requiredModule: ModuleType) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Obtener el rol del usuario desde la sesión
  const userRole = session?.user?.role as string | undefined;

  // Verificar acceso
  const hasAccess = () => {
    if (!userRole) return false;
    
    const allowedModules = rolePermissions[userRole] || [];
    return allowedModules.includes(requiredModule);
  };

  // Redirigir si no tiene acceso
  useEffect(() => {
    // Solo verificar cuando la sesión está cargada
    if (status === "loading") return;

    // Si no hay sesión, redirigir al login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Si hay sesión pero no tiene permiso, redirigir a la página principal
    if (!hasAccess()) {
      router.push("/");
    }
  }, [status, requiredModule, router, userRole]);

  return {
    hasAccess: hasAccess(),
    isLoading: status === "loading",
  };
}