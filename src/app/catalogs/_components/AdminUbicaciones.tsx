"use client";

import { useState } from "react";
import { useCatalogs } from "~/hooks/useCatalogs";

export function AdminUbicaciones() {
  const { ubicaciones, createUbicacion, updateUbicacion, deleteUbicacion, invalidateAll } = useCatalogs();
  const [nuevaUbicacion, setNuevaUbicacion] = useState({ nombre: "", ubicacion: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ nombre: "", ubicacion: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaUbicacion.nombre.trim() || !nuevaUbicacion.ubicacion.trim()) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      await createUbicacion.mutateAsync({
        nombre: nuevaUbicacion.nombre,
        ubicacion: nuevaUbicacion.ubicacion,
      });
      setNuevaUbicacion({ nombre: "", ubicacion: "" });
      await invalidateAll();
    } catch (error) {
      console.error("Error al crear ubicación:", error);
      alert("Error al crear la ubicación.");
    }
  };

  const handleStartEdit = (id: string, nombre: string, ubicacion: string) => {
    setEditingId(id);
    setEditValues({ nombre, ubicacion });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValues.nombre.trim() || !editValues.ubicacion.trim()) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      await updateUbicacion.mutateAsync({
        id,
        nombre: editValues.nombre,
        ubicacion: editValues.ubicacion,
      });
      setEditingId(null);
      setEditValues({ nombre: "", ubicacion: "" });
      await invalidateAll();
    } catch (error) {
      console.error("Error al actualizar ubicación:", error);
      alert("Error al actualizar la ubicación.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar esta ubicación?")) {
      return;
    }

    try {
      await deleteUbicacion.mutateAsync({ id });
      await invalidateAll();
    } catch (error) {
      console.error("Error al eliminar ubicación:", error);
      alert("Error al eliminar la ubicación. Puede que esté siendo utilizada en inventario.");
    }
  };

  if (ubicaciones.isLoading) return <div>Cargando ubicaciones...</div>;
  if (ubicaciones.isError) return <div>Error al cargar ubicaciones.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ubicaciones</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nuevaUbicacion.nombre}
              onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, nombre: e.target.value })}
              placeholder="Nombre de la ubicación"
              className="px-4 py-2 border rounded w-full"
              maxLength={30}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              value={nuevaUbicacion.ubicacion}
              onChange={(e) => setNuevaUbicacion({ ...nuevaUbicacion, ubicacion: e.target.value })}
              placeholder="Descripción de la ubicación"
              className="px-4 py-2 border rounded w-full"
              maxLength={30}
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={createUbicacion.isPending}
        >
          {createUbicacion.isPending ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {!ubicaciones.data || ubicaciones.data.length === 0 ? (
        <div className="text-gray-500 italic">No hay ubicaciones registradas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Ubicación</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ubicaciones.data.map((ubicacion) => (
                <tr key={ubicacion.id}>
                  <td className="py-2 px-4 border-b">
                    {editingId === ubicacion.id ? (
                      <input
                        type="text"
                        value={editValues.nombre}
                        onChange={(e) => setEditValues({ ...editValues, nombre: e.target.value })}
                        className="px-2 py-1 border rounded w-full"
                        maxLength={30}
                      />
                    ) : (
                      ubicacion.nombre
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editingId === ubicacion.id ? (
                      <input
                        type="text"
                        value={editValues.ubicacion}
                        onChange={(e) => setEditValues({ ...editValues, ubicacion: e.target.value })}
                        className="px-2 py-1 border rounded w-full"
                        maxLength={30}
                      />
                    ) : (
                      ubicacion.ubicacion
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editingId === ubicacion.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(ubicacion.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          disabled={updateUbicacion.isPending}
                        >
                          {updateUbicacion.isPending ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(ubicacion.id, ubicacion.nombre, ubicacion.ubicacion)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(ubicacion.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          disabled={deleteUbicacion.isPending}
                        >
                          {deleteUbicacion.isPending ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}