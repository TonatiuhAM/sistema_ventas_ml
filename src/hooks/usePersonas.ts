import { trpc } from "~/utils/api";

export function usePersonas() {
  // Consultas para obtener datos
  const { data: personas, refetch: refetchPersonas } = trpc.personas.getAll.useQuery();
  const { data: estados } = trpc.catalogs.getEstados.useQuery();
  const { data: categoriasPersonas } = trpc.catalogs.getCategoriasPersonas.useQuery();

  // Mutaciones para operaciones CRUD
  const createPersonaMutation = trpc.personas.create.useMutation({
    onSuccess: () => {
      void refetchPersonas();
    },
  });

  const updatePersonaMutation = trpc.personas.update.useMutation({
    onSuccess: () => {
      void refetchPersonas();
    },
  });

  const deletePersonaMutation = trpc.personas.delete.useMutation({
    onSuccess: () => {
      void refetchPersonas();
    },
  });

  // Función para crear nueva persona
  const createPersona = async (personaData: {
    nombre: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    rfc?: string;
    telefono: string;
    email?: string;
    estadosId: string;
    categoriaPersonasId: string;
  }) => {
    await createPersonaMutation.mutateAsync(personaData);
  };

  // Función para actualizar persona existente
  const updatePersona = async (personaData: {
    id: string;
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    rfc?: string;
    telefono?: string;
    email?: string;
    estadosId?: string;
    categoriaPersonasId?: string;
  }) => {
    await updatePersonaMutation.mutateAsync(personaData);
  };

  // Función para eliminar persona
  const deletePersona = async (id: string) => {
    await deletePersonaMutation.mutateAsync({ id });
  };

  return {
    // Datos
    personas,
    estados,
    categoriasPersonas,
    
    // Funciones
    createPersona,
    updatePersona,
    deletePersona,
    
    // Estado de las mutaciones
    isCreating: createPersonaMutation.isPending,
    isUpdating: updatePersonaMutation.isPending,
    isDeleting: deletePersonaMutation.isPending,
    createError: createPersonaMutation.error,
    updateError: updatePersonaMutation.error,
    deleteError: deletePersonaMutation.error,
  };
}