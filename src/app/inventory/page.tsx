"use client";

import { Suspense } from "react";
import { useRolePermissions } from "~/hooks/useRolePermissions";
import { ListaProductos } from "./_components/ListaProductos";
import { InventarioActual } from "./_components/InventarioActual";
import { MovimientoInventario } from "./_components/MovimientoInventario";

export default function InventarioPage() {
  // Verificar permisos de rol
  const { hasAccess, isLoading } = useRolePermissions("inventory");
  
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
          <span className="text-[hsl(280,100%,70%)]">Gestión</span> de Inventario
        </h1>
        
        <div className="w-full grid grid-cols-1 gap-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Productos</h2>
            <Suspense fallback={<div>Cargando productos...</div>}>
              <ListaProductos />
            </Suspense>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Inventario Actual</h2>
            <Suspense fallback={<div>Cargando inventario...</div>}>
              <InventarioActual />
            </Suspense>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Movimientos de Inventario</h2>
            <Suspense fallback={<div>Cargando movimientos...</div>}>
              <MovimientoInventario onSuccess={() => console.log("Movimiento completado")} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}