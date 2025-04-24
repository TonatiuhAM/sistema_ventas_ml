"use client";

import { Suspense } from "react";
import { useRolePermissions } from "~/hooks/useRolePermissions";
import { AdminCategoriasPersonas } from "./_components/AdminCategoriasPersonas";
import { AdminCategoriasProductos } from "./_components/AdminCategoriasProductos";
import { AdminEstados } from "./_components/AdminEstados";
import { AdminMetodosPago } from "./_components/AdminMetodosPago";
import { AdminRoles } from "./_components/AdminRoles";
import { AdminTipoMovimientos } from "./_components/AdminTipoMovimientos";
import { AdminUbicaciones } from "./_components/AdminUbicaciones";

export default function CatalogsPage() {
  // Verificar permisos de rol
  const { hasAccess, isLoading } = useRolePermissions("catalogs");
  
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
          <span className="text-[hsl(280,100%,70%)]">Catálogos</span> del Sistema
        </h1>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Roles de Usuario</h2>
            <Suspense fallback={<div>Cargando roles...</div>}>
              <AdminRoles />
            </Suspense>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Estados</h2>
            <Suspense fallback={<div>Cargando estados...</div>}>
              <AdminEstados />
            </Suspense>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Categorías de Productos</h2>
            <Suspense fallback={<div>Cargando categorías...</div>}>
              <AdminCategoriasProductos />
            </Suspense>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Categorías de Personas</h2>
            <Suspense fallback={<div>Cargando categorías...</div>}>
              <AdminCategoriasPersonas />
            </Suspense>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Métodos de Pago</h2>
            <Suspense fallback={<div>Cargando métodos de pago...</div>}>
              <AdminMetodosPago />
            </Suspense>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Tipos de Movimiento</h2>
            <Suspense fallback={<div>Cargando tipos de movimiento...</div>}>
              <AdminTipoMovimientos />
            </Suspense>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Ubicaciones</h2>
            <Suspense fallback={<div>Cargando ubicaciones...</div>}>
              <AdminUbicaciones />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}