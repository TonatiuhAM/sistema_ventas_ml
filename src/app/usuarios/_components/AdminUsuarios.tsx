"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import FormularioUsuario from "./FormularioUsuario";

// Tipo para nuestra vista de usuario
type UsuarioView = {
  id: string;
  nombre: string;
  email?: string;
  telefono: string;
  rol?: { roles: string } | null;
  estado?: { estado: string } | null;
  rolesId: string;
  estadosId: string;
};

export default function AdminUsuarios() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<UsuarioView | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Consultar la lista de usuarios
  const { data: usuarios, refetch } = api.usuarios.getAll.useQuery();
  
  // Consulta para obtener un usuario por ID cuando selectedUserId cambia
  const { data: usuarioData } = api.usuarios.getById.useQuery(
    { id: selectedUserId || "" },
    { enabled: !!selectedUserId } // Solo ejecutar cuando hay un ID seleccionado
  );
  
  // Usar useEffect para responder cuando llegan los datos del usuario
  useEffect(() => {
    if (usuarioData && selectedUserId) {
      // Establecer los datos del usuario para editar
      setUsuarioToEdit(usuarioData);
      // Abrir el modal
      setIsModalOpen(true);
      // Limpiar el ID seleccionado
      setSelectedUserId(null);
    }
  }, [usuarioData, selectedUserId]);
  
  // Eliminar usuario
  const eliminarUsuario = api.usuarios.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });
  
  // Función para abrir el modal de edición
  const handleEditUsuario = (id: string) => {
    setSelectedUserId(id);
  };
  
  // Función para confirmar la eliminación de un usuario
  const handleDeleteUsuario = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      eliminarUsuario.mutate({ id });
    }
  };
  
  // Función para cerrar el modal y limpiar el estado
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUsuarioToEdit(null);
  };
  
  // Función para actualizar la lista después de crear/editar
  const handleUsuarioSaved = () => {
    void refetch();
    handleCloseModal();
  };
  
  return (
    <div className="w-full">
      {/* Botón para añadir nuevo usuario */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Añadir Usuario
        </button>
      </div>
      
      {/* Modal para crear/editar usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {usuarioToEdit ? "Editar Usuario" : "Crear Usuario"}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={handleCloseModal}
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <FormularioUsuario
              usuarioToEdit={usuarioToEdit}
              onUsuarioSaved={handleUsuarioSaved}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
      
      {/* Tabla de usuarios */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Teléfono
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {usuarios?.map((usuario) => (
              <tr key={usuario.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-500">{usuario.telefono}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-500">{usuario.rol?.roles}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    usuario.estado?.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {usuario.estado?.estado}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => handleEditUsuario(usuario.id)}
                    className="mr-2 text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteUsuario(usuario.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {!usuarios || usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}