import { trpc } from "~/utils/api";
import { useState } from "react";

export const useInventory = () => {
  const utils = trpc.useContext();
  const getAllWithPrices = trpc.inventory.getAllWithPrices.useQuery();
  const create = trpc.inventory.create.useMutation();
  const update = trpc.inventory.update.useMutation();
  const updateWithPrice = trpc.inventory.updateWithPrice.useMutation();
  const updateProductWithInventory = trpc.inventory.updateProductWithInventory.useMutation();
  const remove = trpc.inventory.delete.useMutation();
  const fetchCategorias = trpc.inventory.fetchCategorias.useQuery();
  const fetchProveedores = trpc.inventory.fetchProveedores.useQuery();
  const fetchEstados = trpc.inventory.fetchEstados.useQuery();
  const fetchUbicaciones = trpc.inventory.fetchUbicaciones.useQuery();
  const fetchTipoMovimientos = trpc.inventory.fetchTipoMovimientos.useQuery();
  const registrarMovimiento = trpc.inventory.registrarMovimiento.useMutation();
  const getInventarioActual = trpc.inventory.getInventarioActual.useQuery();
  
  // Estado para el producto actualmente seleccionado
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  
  // Consulta condicional para movimientos
  const getMovimientosProducto = trpc.inventory.getMovimientosProducto.useQuery(
    { productoId: selectedProductId },
    { enabled: !!selectedProductId }
  );
  
  // Función para cargar los movimientos de un producto específico
  const loadMovimientosProducto = (productoId: string) => {
    setSelectedProductId(productoId);
    // No es necesario refetch aquí, el cambio en selectedProductId activará la query
    // return getMovimientosProducto.refetch(); 
  };

  return { 
    getAllWithPrices, 
    create, 
    update, 
    updateWithPrice,
    updateProductWithInventory, 
    remove, 
    fetchCategorias, 
    fetchProveedores, 
    fetchEstados, 
    fetchUbicaciones,
    fetchTipoMovimientos,
    registrarMovimiento,
    getInventarioActual,
    getMovimientosProducto,
    loadMovimientosProducto,
    setSelectedProductId
  };
};