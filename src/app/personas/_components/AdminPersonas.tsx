"use client";

import { useState, useEffect } from "react";
import { usePersonas } from "~/hooks/usePersonas";
import { v4 as uuidv4 } from "uuid";

export function AdminPersonas() {
  const { 
    personas,
    estados,
    categoriasPersonas, 
    createPersona, 
    updatePersona, 
    deletePersona, 
    isCreating,
    isUpdating,
    isDeleting
  } = usePersonas();

  const [form, setForm] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    rfc: "",
    telefono: "",
    email: "",
    estadosId: "",
    categoriaPersonasId: ""
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    rfc: "",
    telefono: "",
    email: "",
    estadosId: "",
    categoriaPersonasId: ""
  });

  const resetForm = () => {
    setForm({
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      rfc: "",
      telefono: "",
      email: "",
      estadosId: "",
      categoriaPersonasId: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar los campos obligatorios
    if (!form.nombre.trim() || !form.telefono.trim() || !form.estadosId || !form.categoriaPersonasId) {
      alert("Por favor completa todos los campos obligatorios (Nombre, Teléfono, Estado y Categoría)");
      return;
    }

    // Validar formato de email si se proporciona
    if (form.email && !validateEmail(form.email)) {
      alert("El formato del email no es válido");
      return;
    }

    try {
      await createPersona({
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno || undefined,
        apellidoMaterno: form.apellidoMaterno || undefined,
        rfc: form.rfc || undefined,
        telefono: form.telefono,
        email: form.email || undefined,
        estadosId: form.estadosId,
        categoriaPersonasId: form.categoriaPersonasId
      });
      resetForm();
    } catch (error) {
      console.error("Error al crear persona:", error);
      alert("Error al crear la persona. Por favor, intenta nuevamente.");
    }
  };

  const handleStartEdit = (persona: any) => {
    setEditingId(persona.id);
    setEditForm({
      nombre: persona.nombre,
      apellidoPaterno: persona.apellidoPaterno || "",
      apellidoMaterno: persona.apellidoMaterno || "",
      rfc: persona.rfc || "",
      telefono: persona.telefono,
      email: persona.email || "",
      estadosId: persona.estadosId,
      categoriaPersonasId: persona.categoriaPersonasId
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    // Validar los campos obligatorios
    if (!editForm.nombre.trim() || !editForm.telefono.trim()) {
      alert("El nombre y teléfono son obligatorios");
      return;
    }

    // Validar formato de email si se proporciona
    if (editForm.email && !validateEmail(editForm.email)) {
      alert("El formato del email no es válido");
      return;
    }

    try {
      await updatePersona({
        id: editingId,
        nombre: editForm.nombre,
        apellidoPaterno: editForm.apellidoPaterno || undefined,
        apellidoMaterno: editForm.apellidoMaterno || undefined,
        rfc: editForm.rfc || undefined,
        telefono: editForm.telefono,
        email: editForm.email || undefined,
        estadosId: editForm.estadosId || undefined,
        categoriaPersonasId: editForm.categoriaPersonasId || undefined
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error al actualizar persona:", error);
      alert("Error al actualizar la persona. Por favor, intenta nuevamente.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar esta persona? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await deletePersona(id);
    } catch (error) {
      console.error("Error al eliminar persona:", error);
      alert("Error al eliminar la persona. Es posible que esté siendo utilizada en otras partes del sistema.");
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (!estados || !categoriasPersonas) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Administración de Personas</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium mb-4">Nueva Persona</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="px-4 py-2 border rounded w-full"
                maxLength={30}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno</label>
              <input
                type="text"
                value={form.apellidoPaterno}
                onChange={(e) => setForm({ ...form, apellidoPaterno: e.target.value })}
                className="px-4 py-2 border rounded w-full"
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
              <input
                type="text"
                value={form.apellidoMaterno}
                onChange={(e) => setForm({ ...form, apellidoMaterno: e.target.value })}
                className="px-4 py-2 border rounded w-full"
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
              <input
                type="text"
                value={form.rfc}
                onChange={(e) => setForm({ ...form, rfc: e.target.value })}
                className="px-4 py-2 border rounded w-full"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="px-4 py-2 border rounded w-full"
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-4 py-2 border rounded w-full"
                maxLength={32}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                value={form.estadosId}
                onChange={(e) => setForm({ ...form, estadosId: e.target.value })}
                className="px-4 py-2 border rounded w-full"
                required
              >
                <option value="">Seleccione un estado</option>
                {estados.map((estado: any) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.estado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                value={form.categoriaPersonasId}
                onChange={(e) => setForm({ ...form, categoriaPersonasId: e.target.value })}
                className="px-4 py-2 border rounded w-full"
                required
              >
                <option value="">Seleccione una categoría</option>
                {categoriasPersonas.map((categoria: any) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isCreating}
            >
              {isCreating ? "Guardando..." : "Guardar Persona"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Personas Registradas</h3>
        
        {!personas || personas.length === 0 ? (
          <p className="text-gray-500 italic">No hay personas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Apellido Paterno</th>
                  <th className="py-2 px-4 border-b">Apellido Materno</th>
                  <th className="py-2 px-4 border-b">Teléfono</th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th className="py-2 px-4 border-b">Estado</th>
                  <th className="py-2 px-4 border-b">Categoría</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((persona: any) => (
                  <tr key={persona.id}>
                    <td className="py-2 px-4 border-b">
                      {editingId === persona.id ? (
                        <input
                          type="text"
                          value={editForm.nombre}
                          onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                          className="px-2 py-1 border rounded w-full"
                          maxLength={30}
                        />
                      ) : (
                        persona.nombre
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === persona.id ? (
                        <input
                          type="text"
                          value={editForm.apellidoPaterno}
                          onChange={(e) => setEditForm({ ...editForm, apellidoPaterno: e.target.value })}
                          className="px-2 py-1 border rounded w-full"
                          maxLength={30}
                        />
                      ) : (
                        persona.apellidoPaterno || "-"
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === persona.id ? (
                        <input
                          type="text"
                          value={editForm.apellidoMaterno}
                          onChange={(e) => setEditForm({ ...editForm, apellidoMaterno: e.target.value })}
                          className="px-2 py-1 border rounded w-full"
                          maxLength={30}
                        />
                      ) : (
                        persona.apellidoMaterno || "-"
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === persona.id ? (
                        <input
                          type="tel"
                          value={editForm.telefono}
                          onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                          className="px-2 py-1 border rounded w-full"
                          maxLength={20}
                        />
                      ) : (
                        persona.telefono
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === persona.id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="px-2 py-1 border rounded w-full"
                          maxLength={32}
                        />
                      ) : (
                        persona.email || "-"
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === persona.id ? (
                        <select
                          value={editForm.estadosId}
                          onChange={(e) => setEditForm({ ...editForm, estadosId: e.target.value })}
                          className="px-2 py-1 border rounded w-full"
                        >
                          {estados.map((estado: any) => (
                            <option key={estado.id} value={estado.id}>
                              {estado.estado}
                            </option>
                          ))}
                        </select>
                      ) : (
                        persona.estado
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === persona.id ? (
                        <select
                          value={editForm.categoriaPersonasId}
                          onChange={(e) => setEditForm({ ...editForm, categoriaPersonasId: e.target.value })}
                          className="px-2 py-1 border rounded w-full"
                        >
                          {categoriasPersonas.map((categoria: any) => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.categoria}
                            </option>
                          ))}
                        </select>
                      ) : (
                        persona.categoria
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {editingId === persona.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Guardando..." : "Guardar"}
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
                            onClick={() => handleStartEdit(persona)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(persona.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
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
    </div>
  );
}