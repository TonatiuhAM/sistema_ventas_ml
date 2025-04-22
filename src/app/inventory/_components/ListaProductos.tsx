"use client";

import { useState } from "react";
import { useInventory } from "~/hooks/useInventory";
import { v4 as uuidv4 } from "uuid";

export const ListaProductos = () => {
  const { 
    getAllWithPrices, 
    remove, 
    updateProductWithInventory, 
    fetchCategorias, 
    fetchProveedores, 
    fetchEstados, 
    fetchUbicaciones,
    getInventarioActual
  } = useInventory();
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    nombre: "",
    categoriasProductosId: "",
    proveedorId: "",
    estadosId: "",
    precio: "",
    actualizarPrecio: false,
    ubicacionId: "",
    cantidadMinima: "",
    cantidadMaxima: ""
  });

  if (
    getAllWithPrices.isLoading || 
    fetchCategorias.isLoading || 
    fetchProveedores.isLoading || 
    fetchEstados.isLoading ||
    fetchUbicaciones.isLoading ||
    getInventarioActual.isLoading
  ) return <p>Cargando...</p>;
  
  if (
    getAllWithPrices.isError || 
    fetchCategorias.isError || 
    fetchProveedores.isError || 
    fetchEstados.isError ||
    fetchUbicaciones.isError ||
    getInventarioActual.isError
  ) return <p>Error al cargar los datos.</p>;

  const categorias = fetchCategorias.data || [];
  const proveedores = fetchProveedores.data || [];
  const estados = fetchEstados.data || [];
  const ubicaciones = fetchUbicaciones.data || [];
  const inventario = getInventarioActual.data || [];

  const getCategoriaName = (id: string) => {
    const categoria = categorias.find(cat => cat.id === id);
    return categoria ? categoria.categoria : "Desconocida";
  };

  const getProveedorName = (id: string) => {
    const proveedor = proveedores.find(prov => prov.id === id);
    return proveedor ? proveedor.nombre : "Desconocido";
  };

  const getEstadoName = (id: string) => {
    const estado = estados.find(est => est.id === id);
    return estado ? estado.estado : "Desconocido";
  };

  const handleEdit = (product: any) => {
    // Buscar el inventario asociado a este producto
    const productoInventario = inventario.find(
      inv => inv.producto.id === product.id
    );
    
    setEditingProductId(product.id);
    setEditForm({
      id: product.id,
      nombre: product.nombre,
      categoriasProductosId: product.categoriasProductosId,
      proveedorId: product.proveedorId,
      estadosId: product.estadosId,
      precio: product.precio ? product.precio.toString() : "",
      actualizarPrecio: false,
      ubicacionId: productoInventario?.ubicacion.id || "",
      cantidadMinima: productoInventario?.inventario.cantidadMinima?.toString() || "",
      cantidadMaxima: productoInventario?.inventario.cantidadMaxima?.toString() || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditForm({
      id: "",
      nombre: "",
      categoriasProductosId: "",
      proveedorId: "",
      estadosId: "",
      precio: "",
      actualizarPrecio: false,
      ubicacionId: "",
      cantidadMinima: "",
      cantidadMaxima: ""
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Usar el nuevo método updateProductWithInventory que registra automáticamente el movimiento EDICION
      await updateProductWithInventory.mutateAsync({
        id: editForm.id,
        nombre: editForm.nombre,
        categoriasProductosId: editForm.categoriasProductosId,
        proveedorId: editForm.proveedorId,
        estadosId: editForm.estadosId,
        precio: parseFloat(editForm.precio),
        actualizarPrecio: editForm.actualizarPrecio,
        ubicacionId: editForm.ubicacionId,
        cantidadMinima: editForm.cantidadMinima ? parseInt(editForm.cantidadMinima) : undefined,
        cantidadMaxima: editForm.cantidadMaxima ? parseInt(editForm.cantidadMaxima) : undefined,
      });
      
      setEditingProductId(null);
      getAllWithPrices.refetch();
      getInventarioActual.refetch();
      
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert("Ocurrió un error al actualizar el producto: " + 
        (error instanceof Error ? error.message : "Error desconocido"));
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto? También se eliminará su historial de precios.")) {
      try {
        await remove.mutateAsync({ id: productId });
        // Recargar la lista de productos
        getAllWithPrices.refetch();
        getInventarioActual.refetch();
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        alert("Ocurrió un error al eliminar el producto.");
      }
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Inventario de Productos</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Precio</th>
              <th className="px-4 py-2 text-left">Categoría</th>
              <th className="px-4 py-2 text-left">Proveedor</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {getAllWithPrices.data?.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                {editingProductId === product.id ? (
                  <td colSpan={6} className="px-4 py-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <h3 className="font-bold mb-2">Editar Producto</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                          <input
                            type="text"
                            value={editForm.nombre}
                            onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                          <select
                            value={editForm.categoriasProductosId}
                            onChange={(e) => setEditForm({ ...editForm, categoriasProductosId: e.target.value })}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Selecciona una categoría</option>
                            {categorias.map((categoria) => (
                              <option key={categoria.id} value={categoria.id}>
                                {categoria.categoria}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                          <select
                            value={editForm.proveedorId}
                            onChange={(e) => setEditForm({ ...editForm, proveedorId: e.target.value })}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Selecciona un proveedor</option>
                            {proveedores.map((proveedor) => (
                              <option key={proveedor.id} value={proveedor.id}>
                                {proveedor.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                          <select
                            value={editForm.estadosId}
                            onChange={(e) => setEditForm({ ...editForm, estadosId: e.target.value })}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Selecciona un estado</option>
                            {estados.map((estado) => (
                              <option key={estado.id} value={estado.id}>
                                {estado.estado}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                          <input
                            type="number"
                            value={editForm.precio}
                            onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                          <select
                            value={editForm.ubicacionId}
                            onChange={(e) => setEditForm({ ...editForm, ubicacionId: e.target.value })}
                            className="w-full p-2 border rounded"
                          >
                            <option value="">Selecciona una ubicación</option>
                            {ubicaciones.map((ubicacion) => (
                              <option key={ubicacion.id} value={ubicacion.id}>
                                {ubicacion.nombre} - {ubicacion.ubicacion}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Mínima</label>
                          <input
                            type="number"
                            value={editForm.cantidadMinima}
                            onChange={(e) => setEditForm({ ...editForm, cantidadMinima: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Máxima</label>
                          <input
                            type="number"
                            value={editForm.cantidadMaxima}
                            onChange={(e) => setEditForm({ ...editForm, cantidadMaxima: e.target.value })}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div className="flex items-center mt-4">
                          <input
                            type="checkbox"
                            id="actualizarPrecio"
                            checked={editForm.actualizarPrecio}
                            onChange={(e) => setEditForm({ ...editForm, actualizarPrecio: e.target.checked })}
                            className="mr-2"
                          />
                          <label htmlFor="actualizarPrecio" className="text-sm font-medium text-gray-700">
                            Registrar como nuevo precio (crea un historial)
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-2">{product.nombre}</td>
                    <td className="px-4 py-2">${product.precio?.toFixed(2) || "N/A"}</td>
                    <td className="px-4 py-2">{getCategoriaName(product.categoriasProductosId)}</td>
                    <td className="px-4 py-2">{getProveedorName(product.proveedorId)}</td>
                    <td className="px-4 py-2">{getEstadoName(product.estadosId)}</td>
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};