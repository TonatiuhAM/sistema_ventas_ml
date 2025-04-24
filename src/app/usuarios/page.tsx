"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import AdminUsuarios from "./_components/AdminUsuarios";
import { useRolePermissions } from "~/hooks/useRolePermissions";

export default function UsuariosPage() {
  const { data: session } = useSession();
  
  // Verificar permisos de rol
  const { hasAccess, isLoading } = useRolePermissions("usuarios");
  
  // Si está cargando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }
  
  // Si no tiene acceso, el hook redirigirá automáticamente
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-[3rem]">
          Administración de <span className="text-[hsl(280,100%,70%)]">Usuarios</span>
        </h1>
        
        <div className="w-full">
          <Suspense fallback={<div>Cargando usuarios...</div>}>
            <AdminUsuarios />
          </Suspense>
        </div>
      </div>
    </main>
  );
}