"use client";

import { Suspense, useState } from "react";
import { useRolePermissions } from "~/hooks/useRolePermissions";
import { TablaInventario } from "./_components/TablaInventario";
import { FormularioProductos } from "./_components/FormularioProductos";
import { MovimientoInventario } from "./_components/MovimientoInventario";

export default function InventarioPage() {
  // Verificar permisos de rol
  const { hasAccess, isLoading } = useRolePermissions("inventory");
  const [showProductForm, setShowProductForm] = useState(false);
  
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Inventario de Productos</h2>
              <button 
                onClick={() => setShowProductForm(!showProductForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {showProductForm ? 'Ocultar Formulario' : 'Nuevo Producto'}
              </button>
            </div>
            
            {showProductForm && (
              <div className="mb-6">
                <FormularioProductos 
                  onSuccess={() => {
                    setShowProductForm(false);
                  }} 
                />
              </div>
            )}
            
            <Suspense fallback={<div>Cargando inventario...</div>}>
              <TablaInventario />
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