"use client";

import { useState } from "react";
import { useCatalogs } from "~/hooks/useCatalogs";

export function AdminCategoriasPersonas() {
  const { categoriasPersonas, createCategoriaPersona, updateCategoriaPersona, deleteCategoriaPersona, invalidateAll } = useCatalogs();
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;

    try {
      await createCategoriaPersona.mutateAsync({ categoria: nuevaCategoria });
      setNuevaCategoria("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al crear categoría de persona:", error);
      alert("Error al crear la categoría de persona.");
    }
  };

  const handleStartEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      await updateCategoriaPersona.mutateAsync({ id, categoria: editValue });
      setEditingId(null);
      setEditValue("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al actualizar categoría de persona:", error);
      alert("Error al actualizar la categoría de persona.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar esta categoría de persona?")) {
      return;
    }

    try {
      await deleteCategoriaPersona.mutateAsync({ id });
      await invalidateAll();
    } catch (error) {
      console.error("Error al eliminar categoría de persona:", error);
      alert("Error al eliminar la categoría de persona. Puede que esté siendo utilizada por algún registro de persona.");
    }
  };

  if (categoriasPersonas.isLoading) return <div>Cargando categorías de personas...</div>;
  if (categoriasPersonas.isError) return <div>Error al cargar categorías de personas.</div>;
  if (!categoriasPersonas.data || categoriasPersonas.data.length === 0) return <div>No hay categorías de personas registradas.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Categorías de Personas</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            placeholder="Nueva categoría de persona"
            className="px-4 py-2 border rounded flex-grow"
            maxLength={30}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={createCategoriaPersona.isPending}
          >
            {createCategoriaPersona.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Categoría</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categoriasPersonas.data.map((categoria) => (
              <tr key={categoria.id}>
                <td className="py-2 px-4 border-b">
                  {editingId === categoria.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="px-2 py-1 border rounded w-full"
                      maxLength={30}
                    />
                  ) : (
                    categoria.categoria
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editingId === categoria.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(categoria.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        disabled={updateCategoriaPersona.isPending}
                      >
                        {updateCategoriaPersona.isPending ? "Guardando..." : "Guardar"}
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
                        onClick={() => handleStartEdit(categoria.id, categoria.categoria)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(categoria.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        disabled={deleteCategoriaPersona.isPending}
                      >
                        {deleteCategoriaPersona.isPending ? "Eliminando..." : "Eliminar"}
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