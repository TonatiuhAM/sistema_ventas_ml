"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderForm } from "../../_components/OrderForm";

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Extraer el ID del workspace de los parámetros
  const workspaceId = params.id;

  useEffect(() => {
    // Cargar el workspace desde localStorage
    const savedWorkspaces = localStorage.getItem("restaurant_workspaces");
    if (savedWorkspaces) {
      try {
        const workspaces = JSON.parse(savedWorkspaces);
        const foundWorkspace = workspaces.find((w: any) => w.id === workspaceId);
        
        if (foundWorkspace) {
          setWorkspace(foundWorkspace);
        } else {
          // Si no se encuentra el workspace, redirigir
          alert("El workspace seleccionado no existe");
          router.push("/restaurant");
        }
      } catch (error) {
        console.error("Error al cargar workspace:", error);
        alert("Error al cargar la información del workspace");
        router.push("/restaurant");
      }
    } else {
      alert("No hay workspaces registrados");
      router.push("/restaurant");
    }
    
    setLoading(false);
  }, [workspaceId, router]);

  const handleOrderSaved = () => {
    router.push("/restaurant");
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Cargando información del workspace...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-8">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-3xl font-extrabold">
            Orden - <span className="text-[hsl(280,100%,70%)]">{workspace?.name}</span>
          </h1>
          <button 
            onClick={() => router.push("/restaurant")}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Regresar a Workspaces
          </button>
        </div>
        
        <div className="w-full">
          {workspace && (
            <OrderForm 
              workspace={workspace} 
              onOrderSaved={handleOrderSaved} 
            />
          )}
        </div>
      </div>
    </main>
  );
}