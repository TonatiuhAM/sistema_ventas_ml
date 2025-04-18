import { trpc } from "~/utils/api";

export const useInventory = () => {
  const getAllWithPrices = trpc.inventory.getAllWithPrices.useQuery();
  const create = trpc.inventory.create.useMutation();
  const update = trpc.inventory.update.useMutation();
  const updateWithPrice = trpc.inventory.updateWithPrice.useMutation();
  const remove = trpc.inventory.delete.useMutation();
  const fetchCategorias = trpc.inventory.fetchCategorias.useQuery();
  const fetchProveedores = trpc.inventory.fetchProveedores.useQuery();
  const fetchEstados = trpc.inventory.fetchEstados.useQuery();

  return { getAllWithPrices, create, update, updateWithPrice, remove, fetchCategorias, fetchProveedores, fetchEstados };
};