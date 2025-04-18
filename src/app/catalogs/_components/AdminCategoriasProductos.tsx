"use client";

import { useState } from "react";
import { useCatalogs } from "~/hooks/useCatalogs";

export function AdminCategoriasProductos() {
  const { categorias, createCategoria, updateCategoria, deleteCategoria, invalidateAll } = useCatalogs();
  const [newCategoria, setNewCategoria] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoria.trim()) return;

    try {
      await createCategoria.mutateAsync({ categoria: newCategoria });
      setNewCategoria("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al crear categoría:", error);
      alert("Error al crear la categoría.");
    }
  };

  const handleStartEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      await updateCategoria.mutateAsync({ id, categoria: editValue });
      setEditingId(null);
      setEditValue("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      alert("Error al actualizar la categoría.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar esta categoría?")) {
      return;
    }

    try {
      await deleteCategoria.mutateAsync({ id });
      await invalidateAll();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert("Error al eliminar la categoría. Puede que esté siendo utilizada por algún producto.");
    }
  };

  if (categorias.isLoading) return <div>Cargando categorías...</div>;
  if (categorias.isError) return <div>Error al cargar categorías.</div>;
  if (!categorias.data || categorias.data.length === 0) return <div>No hay categorías registradas.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Categorías de Productos</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoria}
            onChange={(e) => setNewCategoria(e.target.value)}
            placeholder="Nueva categoría"
            className="px-4 py-2 border rounded flex-grow"
            maxLength={30}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={createCategoria.isPending}
          >
            {createCategoria.isPending ? "Guardando..." : "Guardar"}
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
            {categorias.data.map((categoria) => (
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
                        disabled={updateCategoria.isPending}
                      >
                        {updateCategoria.isPending ? "Guardando..." : "Guardar"}
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
                        disabled={deleteCategoria.isPending}
                      >
                        {deleteCategoria.isPending ? "Eliminando..." : "Eliminar"}
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