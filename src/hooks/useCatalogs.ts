import { trpc } from "~/utils/api";

export const useCatalogs = () => {
  // Categorías de Productos
  const categorias = trpc.catalogs.getCategoriasProductos.useQuery();
  const createCategoria = trpc.catalogs.createCategoriaProducto.useMutation();
  const updateCategoria = trpc.catalogs.updateCategoriaProducto.useMutation();
  const deleteCategoria = trpc.catalogs.deleteCategoriaProducto.useMutation();

  // Estados
  const estados = trpc.catalogs.getEstados.useQuery();
  const createEstado = trpc.catalogs.createEstado.useMutation();
  const updateEstado = trpc.catalogs.updateEstado.useMutation();
  const deleteEstado = trpc.catalogs.deleteEstado.useMutation();

  // Categorías de Personas
  const categoriasPersonas = trpc.catalogs.getCategoriasPersonas.useQuery();
  const createCategoriaPersona = trpc.catalogs.createCategoriaPersona.useMutation();
  const updateCategoriaPersona = trpc.catalogs.updateCategoriaPersona.useMutation();
  const deleteCategoriaPersona = trpc.catalogs.deleteCategoriaPersona.useMutation();

  // Roles
  const roles = trpc.catalogs.getRoles.useQuery();
  const createRol = trpc.catalogs.createRol.useMutation();
  const updateRol = trpc.catalogs.updateRol.useMutation();
  const deleteRol = trpc.catalogs.deleteRol.useMutation();

  // Métodos de Pago
  const metodosPago = trpc.catalogs.getMetodosPago.useQuery();
  const createMetodoPago = trpc.catalogs.createMetodoPago.useMutation();
  const updateMetodoPago = trpc.catalogs.updateMetodoPago.useMutation();
  const deleteMetodoPago = trpc.catalogs.deleteMetodoPago.useMutation();

  // Tipos de Movimientos
  const tipoMovimientos = trpc.catalogs.getTipoMovimientos.useQuery();
  const createTipoMovimiento = trpc.catalogs.createTipoMovimiento.useMutation();
  const updateTipoMovimiento = trpc.catalogs.updateTipoMovimiento.useMutation();
  const deleteTipoMovimiento = trpc.catalogs.deleteTipoMovimiento.useMutation();

  // Ubicaciones
  const ubicaciones = trpc.catalogs.getUbicaciones.useQuery();
  const createUbicacion = trpc.catalogs.createUbicacion.useMutation();
  const updateUbicacion = trpc.catalogs.updateUbicacion.useMutation();
  const deleteUbicacion = trpc.catalogs.deleteUbicacion.useMutation();

  const utils = trpc.useUtils();

  const invalidateAll = async () => {
    await utils.catalogs.invalidate();
  };

  return {
    // Categorías de Productos
    categorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,

    // Estados
    estados,
    createEstado,
    updateEstado,
    deleteEstado,

    // Categorías de Personas
    categoriasPersonas,
    createCategoriaPersona,
    updateCategoriaPersona,
    deleteCategoriaPersona,

    // Roles
    roles,
    createRol,
    updateRol,
    deleteRol,

    // Métodos de Pago
    metodosPago,
    createMetodoPago,
    updateMetodoPago,
    deleteMetodoPago,

    // Tipos de Movimientos
    tipoMovimientos,
    createTipoMovimiento,
    updateTipoMovimiento,
    deleteTipoMovimiento,

    // Ubicaciones
    ubicaciones,
    createUbicacion,
    updateUbicacion,
    deleteUbicacion,

    // Utilidades
    invalidateAll
  };
};