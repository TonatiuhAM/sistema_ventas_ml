import { trpc } from "~/utils/api";

export const useInventory = () => {
  const getAllWithPrices = trpc.inventory.getAllWithPrices.useQuery();
  const create = trpc.inventory.create.useMutation();
  const update = trpc.inventory.update.useMutation();
  const remove = trpc.inventory.delete.useMutation();

  return { getAllWithPrices, create, update, remove };
};