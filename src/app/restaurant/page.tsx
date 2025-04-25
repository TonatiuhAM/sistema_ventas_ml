"use client";

import { Suspense, useState } from "react";
import { useRolePermissions } from "~/hooks/useRolePermissions";
import { WorkspaceList } from "./_components/WorkspaceList";

export default function RestaurantPosPage() {
  const { hasAccess, isLoading } = useRolePermissions("pos");
  
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
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-[3rem]">
          <span className="text-[hsl(280,100%,70%)]">Punto de Venta</span> Restaurante
        </h1>
        
        <div className="w-full">
          <Suspense fallback={<div>Cargando workspaces...</div>}>
            <WorkspaceList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}