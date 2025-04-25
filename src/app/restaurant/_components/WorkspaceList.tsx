"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

interface Workspace {
  id: string;
  name: string;
  status: "available" | "occupied";
  order?: Order;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  workspaceId: string;
  items: OrderItem[];
  timestamp: Date;
  status: "active" | "completed" | "canceled";
}

export const WorkspaceList = () => {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [showWorkspaceOptions, setShowWorkspaceOptions] = useState(false);

  // Cargar workspaces guardados al inicio
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem("restaurant_workspaces");
    if (savedWorkspaces) {
      try {
        const parsedWorkspaces = JSON.parse(savedWorkspaces);
        setWorkspaces(parsedWorkspaces);
      } catch (error) {
        console.error("Error al cargar workspaces:", error);
      }
    }
  }, []);

  // Guardar workspaces cuando cambian
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem("restaurant_workspaces", JSON.stringify(workspaces));
    }
  }, [workspaces]);

  const handleCreateWorkspace = () => {
    setIsCreating(true);
  };

  const submitNewWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWorkspace: Workspace = {
        id: uuidv4(),
        name: newWorkspaceName.trim(),
        status: "available"
      };
      
      setWorkspaces([...workspaces, newWorkspace]);
      setIsCreating(false);
      setNewWorkspaceName("");
    }
  };

  const handleWorkspaceClick = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setShowWorkspaceOptions(true);
  };

  const handleTakeOrder = () => {
    if (selectedWorkspace) {
      // Navegar a la página de toma de orden con el ID del workspace
      router.push(`/restaurant/order/${selectedWorkspace.id}`);
    }
    setShowWorkspaceOptions(false);
  };

  const handleRequestBill = () => {
    if (selectedWorkspace && selectedWorkspace.order) {
      // Implementar lógica para solicitar la cuenta
      alert(`Cuenta solicitada para ${selectedWorkspace.name}`);
      
      // Marcar el workspace como disponible una vez pagada la cuenta
      const updatedWorkspaces = workspaces.map(w => 
        w.id === selectedWorkspace.id 
          ? { ...w, status: "available" as const, order: undefined } 
          : w
      );
      setWorkspaces(updatedWorkspaces);
    } else {
      alert("Este workspace no tiene una orden activa para solicitar cuenta.");
    }
    setShowWorkspaceOptions(false);
  };

  const closeOptions = () => {
    setShowWorkspaceOptions(false);
    setSelectedWorkspace(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Workspaces</h2>
        <button
          onClick={handleCreateWorkspace}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Crear Workspace
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium mb-2">Nuevo Workspace</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newWorkspaceName}
              onChange={e => setNewWorkspaceName(e.target.value)}
              className="flex-1 border p-2 rounded"
              placeholder="Nombre del workspace (ej. Mesa 1)"
            />
            <button
              onClick={submitNewWorkspace}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Grid de Workspaces */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {workspaces.map(workspace => (
          <div
            key={workspace.id}
            onClick={() => handleWorkspaceClick(workspace)}
            className={`
              p-4 rounded-lg shadow cursor-pointer text-center 
              ${workspace.status === "available" 
                ? "bg-green-100 hover:bg-green-200" 
                : "bg-red-100 hover:bg-red-200"}
            `}
          >
            <h3 className="text-lg font-semibold">{workspace.name}</h3>
            <p className={`mt-2 font-medium ${
              workspace.status === "available" ? "text-green-700" : "text-red-700"
            }`}>
              {workspace.status === "available" ? "Disponible" : "Ocupado"}
            </p>
            {workspace.order && (
              <div className="mt-2 text-sm">
                <p>{workspace.order.items.length} productos</p>
                <p className="font-medium">
                  Total: ${workspace.order.items.reduce(
                    (sum, item) => sum + (item.price * item.quantity), 0
                  ).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        ))}

        {workspaces.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay workspaces creados. Crea tu primer workspace.
          </div>
        )}
      </div>

      {/* Modal de opciones de workspace */}
      {showWorkspaceOptions && selectedWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedWorkspace.name} - {selectedWorkspace.status === "available" ? "Disponible" : "Ocupado"}
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={handleTakeOrder}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Tomar Orden
              </button>
              
              <button
                onClick={handleRequestBill}
                disabled={selectedWorkspace.status === "available"}
                className={`w-full py-3 rounded-lg ${
                  selectedWorkspace.status !== "available"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Solicitar Cuenta
              </button>
              
              <button
                onClick={closeOptions}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 mt-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};