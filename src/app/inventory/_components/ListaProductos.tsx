"use client";

import { useInventory } from "~/hooks/useInventory";

export const ListaProductos = () => {
  const { getAllWithPrices } = useInventory();

  if (getAllWithPrices.isLoading) return <p>Cargando...</p>;
  if (getAllWithPrices.isError) return <p>Error al cargar los productos.</p>;

  return (
    <ul>
      {getAllWithPrices.data?.map((product) => (
        <li key={product.id}>
          {product.nombre} - ${product.precio} (Última actualización: 
          {product.fechaDeRegistro 
            ? new Date(product.fechaDeRegistro).toLocaleDateString() 
            : "Sin fecha registrada"}
          )
        </li>
      ))}
    </ul>
  );
};