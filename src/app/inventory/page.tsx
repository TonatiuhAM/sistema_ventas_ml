"use client";

import { FormularioProductos } from "./_components/FormularioProductos";
import { ListaProductos } from "./_components/ListaProductos";

const InventoryPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Inventario</h1>
      <FormularioProductos onSuccess={() => window.location.reload()} />
      <ListaProductos />
    </div>
  );
};

export default InventoryPage;