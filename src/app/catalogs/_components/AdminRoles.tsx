"use client";

import { useState } from "react";
import { useCatalogs } from "~/hooks/useCatalogs";

export function AdminRoles() {
  const { roles, createRol, updateRol, deleteRol, invalidateAll } = useCatalogs();
  const [nuevoRol, setNuevoRol] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoRol.trim()) return;

    try {
      await createRol.mutateAsync({ roles: nuevoRol });
      setNuevoRol("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al crear rol:", error);
      alert("Error al crear el rol.");
    }
  };

  const handleStartEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      await updateRol.mutateAsync({ id, roles: editValue });
      setEditingId(null);
      setEditValue("");
      await invalidateAll();
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      alert("Error al actualizar el rol.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar este rol?")) {
      return;
    }

    try {
      await deleteRol.mutateAsync({ id });
      await invalidateAll();
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      alert("Error al eliminar el rol. Puede que esté siendo utilizado por algún usuario.");
    }
  };

  if (roles.isLoading) return <div>Cargando roles...</div>;
  if (roles.isError) return <div>Error al cargar roles.</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Roles de Usuario</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevoRol}
            onChange={(e) => setNuevoRol(e.target.value)}
            placeholder="Nuevo rol"
            className="px-4 py-2 border rounded flex-grow"
            maxLength={20}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={createRol.isPending}
          >
            {createRol.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      {!roles.data || roles.data.length === 0 ? (
        <div className="text-gray-500 italic">No hay roles registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Rol</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.data.map((rol) => (
                <tr key={rol.id}>
                  <td className="py-2 px-4 border-b">
                    {editingId === rol.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="px-2 py-1 border rounded w-full"
                        maxLength={20}
                      />
                    ) : (
                      rol.roles
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {editingId === rol.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(rol.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          disabled={updateRol.isPending}
                        >
                          {updateRol.isPending ? "Guardando..." : "Guardar"}
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
                          onClick={() => handleStartEdit(rol.id, rol.roles)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(rol.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          disabled={deleteRol.isPending}
                        >
                          {deleteRol.isPending ? "Eliminando..." : "Eliminar"}
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