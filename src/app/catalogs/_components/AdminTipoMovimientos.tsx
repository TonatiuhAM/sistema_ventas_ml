"use client";

import { useState } from "react";
import { useCatalogs } from "~/hooks/useCatalogs";

export function AdminTipoMovimientos() {
  const { tipoMovimientos, createTipoMovimiento, updateTipoMovimiento, deleteTipoMovimiento, invalidateAll } = useCatalogs();
  const [nuevoMovimiento, setNuevoMovimiento] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMovimiento.trim()) return;

    try {
      await createTipoMovimiento.mutateAsync({ movimiento: nuevoMovimiento });
      setNuevoMovimiento("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al crear tipo de movimiento:", error);
      alert("Error al crear el tipo de movimiento.");
    }
  };

  const handleStartEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      await updateTipoMovimiento.mutateAsync({ id, movimiento: editValue });
      setEditingId(null);
      setEditValue("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al actualizar tipo de movimiento:", error);
      alert("Error al actualizar el tipo de movimiento.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar este tipo de movimiento?")) {
      return;
    }

    try {
      await deleteTipoMovimiento.mutateAsync({ id });
      await invalidateAll();
    } catch (error) {
      console.error("Error al eliminar tipo de movimiento:", error);
      alert("Error al eliminar el tipo de movimiento. Puede que esté siendo utilizado en algún registro de movimiento de inventario.");
    }
  };

  if (tipoMovimientos.isLoading) return <div>Cargando tipos de movimientos...</div>;
  if (tipoMovimientos.isError) return <div>Error al cargar tipos de movimientos.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tipos de Movimientos</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevoMovimiento}
            onChange={(e) => setNuevoMovimiento(e.target.value)}
            placeholder="Nuevo tipo de movimiento"
            className="px-4 py-2 border rounded flex-grow"
            maxLength={12}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={createTipoMovimiento.isPending}
          >
            {createTipoMovimiento.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      {!tipoMovimientos.data || tipoMovimientos.data.length === 0 ? (
        <div className="text-gray-500 italic">No hay tipos de movimientos registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Tipo de Movimiento</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipoMovimientos.data.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td className="py-2 px-4 border-b">
                    {editingId === movimiento.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-2 py-1 border rounded w-full"
                        maxLength={12}
                      />
                    ) : (
                      movimiento.movimiento
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editingId === movimiento.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(movimiento.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          disabled={updateTipoMovimiento.isPending}
                        >
                          {updateTipoMovimiento.isPending ? "Guardando..." : "Guardar"}
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
                          onClick={() => handleStartEdit(movimiento.id, movimiento.movimiento)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(movimiento.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          disabled={deleteTipoMovimiento.isPending}
                        >
                          {deleteTipoMovimiento.isPending ? "Eliminando..." : "Eliminar"}
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