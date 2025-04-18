"use client";

import { useState } from "react";
import { useCatalogs } from "~/hooks/useCatalogs";

export function AdminMetodosPago() {
  const { metodosPago, createMetodoPago, updateMetodoPago, deleteMetodoPago, invalidateAll } = useCatalogs();
  const [nuevoMetodo, setNuevoMetodo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMetodo.trim()) return;

    try {
      await createMetodoPago.mutateAsync({ metodoPago: nuevoMetodo });
      setNuevoMetodo("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al crear método de pago:", error);
      alert("Error al crear el método de pago.");
    }
  };

  const handleStartEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      await updateMetodoPago.mutateAsync({ id, metodoPago: editValue });
      setEditingId(null);
      setEditValue("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al actualizar método de pago:", error);
      alert("Error al actualizar el método de pago.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar este método de pago?")) {
      return;
    }

    try {
      await deleteMetodoPago.mutateAsync({ id });
      await invalidateAll();
    } catch (error) {
      console.error("Error al eliminar método de pago:", error);
      alert("Error al eliminar el método de pago. Puede que esté siendo utilizado en alguna transacción.");
    }
  };

  if (metodosPago.isLoading) return <div>Cargando métodos de pago...</div>;
  if (metodosPago.isError) return <div>Error al cargar métodos de pago.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Métodos de Pago</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevoMetodo}
            onChange={(e) => setNuevoMetodo(e.target.value)}
            placeholder="Nuevo método de pago"
            className="px-4 py-2 border rounded flex-grow"
            maxLength={30}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={createMetodoPago.isPending}
          >
            {createMetodoPago.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      {!metodosPago.data || metodosPago.data.length === 0 ? (
        <div className="text-gray-500 italic">No hay métodos de pago registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Método de Pago</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {metodosPago.data.map((metodo) => (
                <tr key={metodo.id}>
                  <td className="py-2 px-4 border-b">
                    {editingId === metodo.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-2 py-1 border rounded w-full"
                        maxLength={30}
                      />
                    ) : (
                      metodo.metodoPago
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editingId === metodo.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(metodo.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          disabled={updateMetodoPago.isPending}
                        >
                          {updateMetodoPago.isPending ? "Guardando..." : "Guardar"}
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
                          onClick={() => handleStartEdit(metodo.id, metodo.metodoPago)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(metodo.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          disabled={deleteMetodoPago.isPending}
                        >
                          {deleteMetodoPago.isPending ? "Eliminando..." : "Eliminar"}
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