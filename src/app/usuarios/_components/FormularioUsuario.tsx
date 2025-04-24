"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { z } from "zod";

// Definimos esquemas separados para crear y actualizar usuarios
const baseUsuarioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  telefono: z.string().min(10, "Ingresa un número de teléfono válido"),
  rolesId: z.string().uuid("Selecciona un rol válido"),
  estadosId: z.string().uuid("Selecciona un estado válido"),
});

// Esquema para crear nuevos usuarios (contraseña requerida)
const createUsuarioSchema = baseUsuarioSchema.extend({
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmarContrasena: z.string(),
}).refine(
  (data) => data.contrasena === data.confirmarContrasena,
  {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
  }
);

// Esquema para actualizar usuarios (contraseña opcional)
const updateUsuarioSchema = baseUsuarioSchema.extend({
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
  confirmarContrasena: z.string().optional().or(z.literal("")),
}).refine(
  (data) => !data.contrasena || data.contrasena === data.confirmarContrasena,
  {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
  }
);

type Usuario = {
  id: string;
  nombre: string;
  email?: string;
  telefono: string;
  rol?: { roles: string } | null;
  estado?: { estado: string } | null;
  rolesId: string;
  estadosId: string;
};

type FormularioUsuarioProps = {
  usuarioToEdit: Usuario | null;
  onUsuarioSaved: () => void;
  onCancel: () => void;
};

export default function FormularioUsuario({
  usuarioToEdit,
  onUsuarioSaved,
  onCancel,
}: FormularioUsuarioProps) {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contrasena: "",
    confirmarContrasena: "",
    telefono: "",
    rolesId: "",
    estadosId: "",
  });
  
  // Estado para los errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Estado para el mensaje de error general
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Obtenemos la lista de roles y estados para los selectores
  const { data: roles } = api.usuarios.getRoles.useQuery();
  const { data: estados } = api.usuarios.getEstados.useQuery();
  
  // Mutaciones para crear y actualizar usuarios
  const crearUsuario = api.usuarios.create.useMutation({
    onSuccess: () => {
      onUsuarioSaved();
    },
    onError: (error) => {
      setGeneralError(error.message);
    },
  });
  
  const actualizarUsuario = api.usuarios.update.useMutation({
    onSuccess: () => {
      onUsuarioSaved();
    },
    onError: (error) => {
      setGeneralError(error.message);
    },
  });
  
  // Efecto para cargar los datos del usuario a editar
  useEffect(() => {
    if (usuarioToEdit) {
      setFormData({
        nombre: usuarioToEdit.nombre,
        email: usuarioToEdit.email || "",
        contrasena: "",
        confirmarContrasena: "",
        telefono: usuarioToEdit.telefono,
        rolesId: usuarioToEdit.rolesId,
        estadosId: usuarioToEdit.estadosId,
      });
    }
  }, [usuarioToEdit]);
  
  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error específico del campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Limpiar error general
    if (generalError) {
      setGeneralError(null);
    }
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    
    try {
      if (usuarioToEdit) {
        // Validación para actualizar usuario
        const validatedData = updateUsuarioSchema.parse(formData);
        
        // Actualizando usuario existente
        const updateData = {
          id: usuarioToEdit.id,
          ...validatedData,
        };
        
        // Si no hay cambios en la contraseña, no la enviamos
        if (!validatedData.contrasena) {
          delete updateData.contrasena;
          delete updateData.confirmarContrasena;
        }
        
        actualizarUsuario.mutate(updateData);
      } else {
        // Validación para crear usuario
        const validatedData = createUsuarioSchema.parse(formData);
        
        // La contraseña es requerida para nuevos usuarios
        if (!validatedData.contrasena) {
          throw new Error("La contraseña es obligatoria para nuevos usuarios");
        }
        
        // Creando nuevo usuario (forzando el tipo para asegurar que contrasena existe)
        crearUsuario.mutate({
          nombre: validatedData.nombre,
          email: validatedData.email,
          telefono: validatedData.telefono,
          rolesId: validatedData.rolesId,
          estadosId: validatedData.estadosId,
          contrasena: validatedData.contrasena,
          confirmarContrasena: validatedData.confirmarContrasena,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        setGeneralError(error.message);
        console.error("Error al procesar el formulario:", error);
      } else {
        setGeneralError("Ha ocurrido un error inesperado.");
        console.error("Error al procesar el formulario:", error);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{generalError}</h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          name="nombre"
          id="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.nombre ? "border-red-300" : ""
          }`}
          placeholder="Nombre del usuario"
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.email ? "border-red-300" : ""
          }`}
          placeholder="correo@ejemplo.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>
      
      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="text"
          name="telefono"
          id="telefono"
          value={formData.telefono}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.telefono ? "border-red-300" : ""
          }`}
          placeholder="Teléfono"
        />
        {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
      </div>
      
      {/* Contraseña */}
      <div>
        <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
          {usuarioToEdit ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
        </label>
        <input
          type="password"
          name="contrasena"
          id="contrasena"
          value={formData.contrasena}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.contrasena ? "border-red-300" : ""
          }`}
          placeholder={usuarioToEdit ? "Nueva contraseña" : "Contraseña"}
        />
        {errors.contrasena && <p className="mt-1 text-sm text-red-600">{errors.contrasena}</p>}
      </div>
      
      {/* Confirmar Contraseña */}
      <div>
        <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700">
          Confirmar Contraseña
        </label>
        <input
          type="password"
          name="confirmarContrasena"
          id="confirmarContrasena"
          value={formData.confirmarContrasena}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.confirmarContrasena ? "border-red-300" : ""
          }`}
          placeholder="Confirmar contraseña"
        />
        {errors.confirmarContrasena && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmarContrasena}</p>
        )}
      </div>
      
      {/* Rol */}
      <div>
        <label htmlFor="rolesId" className="block text-sm font-medium text-gray-700">
          Rol
        </label>
        <select
          name="rolesId"
          id="rolesId"
          value={formData.rolesId}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.rolesId ? "border-red-300" : ""
          }`}
        >
          <option value="">Seleccione un rol</option>
          {roles?.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.roles}
            </option>
          ))}
        </select>
        {errors.rolesId && <p className="mt-1 text-sm text-red-600">{errors.rolesId}</p>}
      </div>
      
      {/* Estado */}
      <div>
        <label htmlFor="estadosId" className="block text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          name="estadosId"
          id="estadosId"
          value={formData.estadosId}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.estadosId ? "border-red-300" : ""
          }`}
        >
          <option value="">Seleccione un estado</option>
          {estados?.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estado.estado}
            </option>
          ))}
        </select>
        {errors.estadosId && <p className="mt-1 text-sm text-red-600">{errors.estadosId}</p>}
      </div>
      
      {/* Botones */}
      <div className="mt-5 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={crearUsuario.isPending || actualizarUsuario.isPending}
        >
          {crearUsuario.isPending || actualizarUsuario.isPending ? (
            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : null}
          {usuarioToEdit ? "Actualizar" : "Crear"} Usuario
        </button>
      </div>
    </form>
  );
}