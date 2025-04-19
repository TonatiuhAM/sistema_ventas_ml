"use client";

import { useState } from "react";
import { FormularioProductos } from "./_components/FormularioProductos";
import { MovimientoInventario } from "./_components/MovimientoInventario";
import { InventarioActual } from "./_components/InventarioActual";

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState<string>("inventario");

  const handleSuccess = () => {
    // Refrescar la página cuando se realiza una operación exitosa
    window.location.reload();
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "nuevo-producto":
        return <FormularioProductos onSuccess={handleSuccess} />;
      case "movimiento":
        return <MovimientoInventario onSuccess={handleSuccess} />;
      case "inventario":
      default:
        return <InventarioActual />;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Inventario</h1>
      
      {/* Pestañas de navegación */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "inventario" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("inventario")}
        >
          Inventario Actual
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "nuevo-producto" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("nuevo-producto")}
        >
          Nuevo Producto
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "movimiento" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("movimiento")}
        >
          Registrar Movimiento
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="bg-white p-0 rounded-lg shadow">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default InventoryPage;