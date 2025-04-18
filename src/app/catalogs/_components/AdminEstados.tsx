"use client";

import { useState } from "react";
import { useCatalogs } from "~/hooks/useCatalogs";

export function AdminEstados() {
  const { estados, createEstado, updateEstado, deleteEstado, invalidateAll } = useCatalogs();
  const [newEstado, setNewEstado] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstado.trim()) return;

    try {
      await createEstado.mutateAsync({ estado: newEstado });
      setNewEstado("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al crear estado:", error);
      alert("Error al crear el estado.");
    }
  };

  const handleStartEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      await updateEstado.mutateAsync({ id, estado: editValue });
      setEditingId(null);
      setEditValue("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("Error al actualizar el estado.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar este estado?")) {
      return;
    }

    try {
      await deleteEstado.mutateAsync({ id });
      await invalidateAll();
    } catch (error) {
      console.error("Error al eliminar estado:", error);
      alert("Error al eliminar el estado. Puede que esté siendo utilizado por algún registro.");
    }
  };

  if (estados.isLoading) return <div>Cargando estados...</div>;
  if (estados.isError) return <div>Error al cargar estados.</div>;
  if (!estados.data || estados.data.length === 0) return <div>No hay estados registrados.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Estados</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newEstado}
            onChange={(e) => setNewEstado(e.target.value)}
            placeholder="Nuevo estado"
            className="px-4 py-2 border rounded flex-grow"
            maxLength={20}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={createEstado.isPending}
          >
            {createEstado.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Estado</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estados.data.map((estado) => (
              <tr key={estado.id}>
                <td className="py-2 px-4 border-b">
                  {editingId === estado.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="px-2 py-1 border rounded w-full"
                      maxLength={20}
                    />
                  ) : (
                    estado.estado
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingId === estado.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(estado.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        disabled={updateEstado.isPending}
                      >
                        {updateEstado.isPending ? "Guardando..." : "Guardar"}
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
                        onClick={() => handleStartEdit(estado.id, estado.estado)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(estado.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        disabled={deleteEstado.isPending}
                      >
                        {deleteEstado.isPending ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}