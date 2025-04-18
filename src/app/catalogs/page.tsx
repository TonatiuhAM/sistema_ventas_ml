"use client";

import { useState } from "react";
import { AdminCategoriasProductos } from "~/app/catalogs/_components/AdminCategoriasProductos";
import { AdminEstados } from "~/app/catalogs/_components/AdminEstados";
import { AdminCategoriasPersonas } from "~/app/catalogs/_components/AdminCategoriasPersonas";
import { AdminRoles } from "~/app/catalogs/_components/AdminRoles";
import { AdminMetodosPago } from "~/app/catalogs/_components/AdminMetodosPago";
import { AdminTipoMovimientos } from "~/app/catalogs/_components/AdminTipoMovimientos";
import { AdminUbicaciones } from "~/app/catalogs/_components/AdminUbicaciones";

export default function CatalogsPage() {
  const [activeCatalog, setActiveCatalog] = useState<string>("categorias");

  const renderCatalog = () => {
    switch (activeCatalog) {
      case "categorias":
        return <AdminCategoriasProductos />;
      case "estados":
        return <AdminEstados />;
      case "categoriasPersonas":
        return <AdminCategoriasPersonas />;
      case "roles":
        return <AdminRoles />;
      case "metodosPago":
        return <AdminMetodosPago />;
      case "tipoMovimientos":
        return <AdminTipoMovimientos />;
      case "ubicaciones":
        return <AdminUbicaciones />;
      default:
        return <AdminCategoriasProductos />;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Administración de Catálogos</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeCatalog === "categorias" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveCatalog("categorias")}
        >
          Categorías de Productos
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeCatalog === "estados" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveCatalog("estados")}
        >
          Estados
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeCatalog === "categoriasPersonas" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveCatalog("categoriasPersonas")}
        >
          Categorías de Personas
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeCatalog === "roles" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveCatalog("roles")}
        >
          Roles
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeCatalog === "metodosPago" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveCatalog("metodosPago")}
        >
          Métodos de Pago
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeCatalog === "tipoMovimientos" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveCatalog("tipoMovimientos")}
        >
          Tipos de Movimientos
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeCatalog === "ubicaciones" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveCatalog("ubicaciones")}
        >
          Ubicaciones
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {renderCatalog()}
      </div>
    </div>
  );
}