"use client";

import { useState, useEffect } from "react";
import { useInventory } from "~/hooks/useInventory";
import { formatCurrency } from "~/utils/fortmatter"; // Importar formateador de moneda

export const InventarioActual = () => {
  const {
    getInventarioActual,
    getMovimientosProducto,
    loadMovimientosProducto,
    // Añadir hooks necesarios para la edición
    updateProductWithInventory,
    fetchCategorias,
    fetchProveedores,
    fetchEstados,
    fetchUbicaciones,
  } = useInventory();

  const [inventario, setInventario] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [inventarioFiltrado, setInventarioFiltrado] = useState<any[]>([]);
  const [ordenamiento, setOrdenamiento] = useState<{ campo: string; orden: 'asc' | 'desc' }>({ campo: "nombre", orden: "asc" });
  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [cargandoMovimientos, setCargandoMovimientos] = useState<boolean>(false);

  // Estados para la edición inline
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // Usará `producto.id`-`ubicacion.id`
  const [editForm, setEditForm] = useState({
    id: "", // ID del producto
    nombre: "",
    categoriasProductosId: "",
    proveedorId: "",
    estadosId: "",
    precio: "",
    actualizarPrecio: false,
    ubicacionId: "", // ID de la ubicación (no editable aquí, pero necesario)
    cantidadMinima: "",
    cantidadMaxima: "",
  });

  // Cargar datos para los selects del formulario de edición
  const { data: categorias = [] } = fetchCategorias;
  const { data: proveedores = [] } = fetchProveedores;
  const { data: estados = [] } = fetchEstados;
  const { data: ubicaciones = [] } = fetchUbicaciones;

  useEffect(() => {
    if (getInventarioActual.data) {
      setInventario(getInventarioActual.data);
      setInventarioFiltrado(getInventarioActual.data);
    }
  }, [getInventarioActual.data]);

  // Aplicar filtro de búsqueda
  useEffect(() => {
    if (busqueda.trim() === "") {
      setInventarioFiltrado(inventario);
    } else {
      const filtrado = inventario.filter(item => 
        item.producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setInventarioFiltrado(filtrado);
    }
  }, [busqueda, inventario]);

  // Ordenar inventario
  useEffect(() => {
    const ordenado = [...inventarioFiltrado].sort((a, b) => {
      let valorA, valorB;

      switch (ordenamiento.campo) {
        case "nombre":
          valorA = a.producto.nombre.toLowerCase();
          valorB = b.producto.nombre.toLowerCase();
          break;
        case "ubicacion":
          valorA = a.ubicacion.nombre.toLowerCase();
          valorB = b.ubicacion.nombre.toLowerCase();
          break;
        case "stock":
          valorA = a.inventario.cantidadDisponible;
          valorB = b.inventario.cantidadDisponible;
          break;
        default:
          valorA = a.producto.nombre.toLowerCase();
          valorB = b.producto.nombre.toLowerCase();
      }

      if (ordenamiento.orden === "asc") {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });

    setInventarioFiltrado(ordenado);
  }, [ordenamiento]);

  const handleVerMovimientos = async (productoId: string) => {
    setProductoSeleccionado(productoId);
    setCargandoMovimientos(true);
    try {
      // Usando la nueva función helper para cargar los movimientos
      await loadMovimientosProducto(productoId);
      if (getMovimientosProducto.data) {
        setMovimientos(getMovimientosProducto.data);
      }
    } catch (error) {
      console.error("Error al obtener los movimientos:", error);
    } finally {
      setCargandoMovimientos(false);
    }
  };

  const getAlertaStock = (item: any) => {
    const { cantidadDisponible, cantidadMinima, cantidadMaxima } = item.inventario;
    
    if (cantidadDisponible <= cantidadMinima) {
      return "bg-red-100 border-red-500";
    } else if (cantidadDisponible >= cantidadMaxima) {
      return "bg-yellow-100 border-yellow-500";
    }
    return "";
  };

  const formatoFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- Funciones para Edición Inline ---
  const handleEdit = (item: any) => {
    const uniqueId = `${item.producto.id}-${item.ubicacion.id}`;
    setEditingItemId(uniqueId);
    setEditForm({
      id: item.producto.id,
      nombre: item.producto.nombre,
      categoriasProductosId: item.producto.categoriasProductosId,
      proveedorId: item.producto.proveedorId,
      estadosId: item.producto.estadosId,
      precio: item.precio ? item.precio.toString() : "",
      actualizarPrecio: false,
      ubicacionId: item.ubicacion.id, // Guardar la ubicación actual
      cantidadMinima: item.inventario.cantidadMinima?.toString() || "",
      cantidadMaxima: item.inventario.cantidadMaxima?.toString() || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    // Resetear formulario si es necesario
  };

  const handleSaveEdit = async () => {
    if (!editingItemId) return;

    try {
      await updateProductWithInventory.mutateAsync({
        id: editForm.id,
        nombre: editForm.nombre,
        categoriasProductosId: editForm.categoriasProductosId,
        proveedorId: editForm.proveedorId,
        estadosId: editForm.estadosId,
        precio: parseFloat(editForm.precio) || 0,
        actualizarPrecio: editForm.actualizarPrecio,
        ubicacionId: editForm.ubicacionId, // Usar la ubicación guardada
        cantidadMinima: editForm.cantidadMinima
          ? parseInt(editForm.cantidadMinima)
          : undefined,
        cantidadMaxima: editForm.cantidadMaxima
          ? parseInt(editForm.cantidadMaxima)
          : undefined,
        // cantidadActual no se modifica directamente aquí, se maneja por movimientos
      });

      setEditingItemId(null);
      getInventarioActual.refetch(); // Refrescar datos después de guardar
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      alert(
        "Ocurrió un error al actualizar: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    }
  };
  // --- Fin Funciones para Edición Inline ---

  if (
    getInventarioActual.isLoading ||
    fetchCategorias.isLoading ||
    fetchProveedores.isLoading ||
    fetchEstados.isLoading ||
    fetchUbicaciones.isLoading
  ) {
    return <div className="text-center py-8">Cargando datos...</div>;
  }

  if (
    getInventarioActual.isError ||
    fetchCategorias.isError ||
    fetchProveedores.isError ||
    fetchEstados.isError ||
    fetchUbicaciones.isError
  ) {
    return (
      <div className="text-center py-8 text-red-500">
        Error al cargar los datos necesarios.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Inventario Actual</h3>
      
      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <select 
            className="p-2 border rounded"
            value={`${ordenamiento.campo}-${ordenamiento.orden}`}
            onChange={(e) => {
              const values = e.target.value.split('-');
              const campo = values[0] || "nombre"; // Valor por defecto si está indefinido
              const orden = (values[1] || "asc") as 'asc' | 'desc'; // Valor por defecto si está indefinido
              setOrdenamiento({ campo, orden });
            }}
          >
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="nombre-desc">Nombre (Z-A)</option>
            <option value="ubicacion-asc">Ubicación (A-Z)</option>
            <option value="ubicacion-desc">Ubicación (Z-A)</option>
            <option value="stock-asc">Stock (Menor a Mayor)</option>
            <option value="stock-desc">Stock (Mayor a Menor)</option>
          </select>
        </div>
        
        <button 
          onClick={() => getInventarioActual.refetch()}
          className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
        >
          <span role="img" aria-label="Refrescar">🔄</span> Actualizar
        </button>
      </div>
      
      {/* Tabla de inventario */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr><th className="px-4 py-2 text-left">Producto</th><th className="px-4 py-2 text-left">Ubicación</th><th className="px-4 py-2 text-right">Precio</th><th className="px-4 py-2 text-center">Stock</th><th className="px-4 py-2 text-center">Mín</th><th className="px-4 py-2 text-center">Máx</th><th className="px-4 py-2 text-center">Acciones</th></tr>
          </thead>
          <tbody>
            {inventarioFiltrado.length > 0 ? (
              inventarioFiltrado.map((item) => {
                const uniqueId = `${item.producto.id}-${item.ubicacion.id}`;
                const isEditing = editingItemId === uniqueId;

                return (
                  <tr
                    key={uniqueId}
                    className={`border-t hover:bg-gray-50 ${getAlertaStock(item)} ${isEditing ? 'bg-blue-50' : ''}`}
                  >{isEditing ? (
                      <td colSpan={7} className="px-4 py-4">
                        <div className="bg-gray-50 p-4 rounded">
                          <h4 className="font-bold mb-3 text-sm">Editando: {item.producto.nombre} en {item.ubicacion.nombre}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Nombre */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                              <input
                                type="text"
                                value={editForm.nombre}
                                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                                className="w-full p-1.5 border rounded text-sm"
                              />
                            </div>
                            {/* Categoría */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
                              <select
                                value={editForm.categoriasProductosId}
                                onChange={(e) => setEditForm({ ...editForm, categoriasProductosId: e.target.value })}
                                className="w-full p-1.5 border rounded text-sm"
                              >
                                <option value="">Selecciona</option>
                                {categorias.map((cat) => (
                                  <option key={cat.id} value={cat.id}>{cat.categoria}</option>
                                ))}
                              </select>
                            </div>
                            {/* Proveedor */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
                              <select
                                value={editForm.proveedorId}
                                onChange={(e) => setEditForm({ ...editForm, proveedorId: e.target.value })}
                                className="w-full p-1.5 border rounded text-sm"
                              >
                                <option value="">Selecciona</option>
                                {proveedores.map((prov) => (
                                  <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                                ))}
                              </select>
                            </div>
                            {/* Estado */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                              <select
                                value={editForm.estadosId}
                                onChange={(e) => setEditForm({ ...editForm, estadosId: e.target.value })}
                                className="w-full p-1.5 border rounded text-sm"
                              >
                                <option value="">Selecciona</option>
                                {estados.map((est) => (
                                  <option key={est.id} value={est.id}>{est.estado}</option>
                                ))}
                              </select>
                            </div>
                            {/* Precio */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.precio}
                                onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                                className="w-full p-1.5 border rounded text-sm"
                              />
                            </div>
                            {/* Cantidad Mínima */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad Mínima</label>
                              <input
                                type="number"
                                value={editForm.cantidadMinima}
                                onChange={(e) => setEditForm({ ...editForm, cantidadMinima: e.target.value })}
                                className="w-full p-1.5 border rounded text-sm"
                              />
                            </div>
                            {/* Cantidad Máxima */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad Máxima</label>
                              <input
                                type="number"
                                value={editForm.cantidadMaxima}
                                onChange={(e) => setEditForm({ ...editForm, cantidadMaxima: e.target.value })}
                                className="w-full p-1.5 border rounded text-sm"
                              />
                            </div>
                          </div>
                          {/* Checkbox para actualizar precio */}
                          <div className="flex items-center mt-3">
                            <input
                              type="checkbox"
                              id="actualizarPrecio"
                              checked={editForm.actualizarPrecio}
                              onChange={(e) => setEditForm({ ...editForm, actualizarPrecio: e.target.checked })}
                              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="actualizarPrecio" className="text-sm text-gray-600">
                              Registrar como nuevo precio (crea historial)
                            </label>
                          </div>
                          {/* Botones de acción */}
                          <div className="flex justify-end space-x-2 mt-4">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      </td>
                    ) : (<>
                        <td className="px-4 py-3"><div>{item.producto.nombre}</div></td>
                        <td className="px-4 py-3"><div>{item.ubicacion.nombre}</div><div className="text-xs text-gray-500">{item.ubicacion.ubicacion}</div></td>
                        <td className="px-4 py-3 text-right">{formatCurrency(item.precio)}</td>
                        <td className="px-4 py-3 text-center font-medium">{item.inventario.cantidadDisponible}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{item.inventario.cantidadMinima}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{item.inventario.cantidadMaxima}</td>
                        <td className="px-4 py-3 text-center space-x-1">
                          <button onClick={() => handleEdit(item)} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 text-xs">Editar</button>
                          <button onClick={() => handleVerMovimientos(item.producto.id)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 text-xs">Movimientos</button>
                        </td>
                    </>)}</tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-3 text-center text-gray-500"> {/* Ajustar colSpan */} 
                  No se encontraron productos en el inventario.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de movimientos de inventario */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Historial de Movimientos - {inventario.find(item => item.producto.id === productoSeleccionado)?.producto.nombre}
              </h3>
              <button 
                onClick={() => setProductoSeleccionado(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {cargandoMovimientos ? (
                <div className="text-center py-4">Cargando movimientos...</div>
              ) : movimientos.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Fecha</th><th className="px-4 py-2 text-left">Tipo</th><th className="px-4 py-2 text-center">Cantidad</th><th className="px-4 py-2 text-left">Ubicación</th><th className="px-4 py-2 text-left">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map((mov) => (
                      <tr key={mov.id} className="border-t"><td className="px-4 py-2 text-sm">{formatoFecha(mov.fecha)}</td><td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs ${
                            mov.tipoMovimiento === 'COMPRA' || mov.tipoMovimiento === 'ENTRADA' 
                              ? 'bg-green-100 text-green-800' 
                              : mov.tipoMovimiento === 'VENTA' || mov.tipoMovimiento === 'SALIDA'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>{mov.tipoMovimiento}</span></td><td className="px-4 py-2 text-center">{mov.cantidad}</td><td className="px-4 py-2 text-sm">{mov.ubicacion.nombre}</td><td className="px-4 py-2 text-sm">{mov.usuario?.nombre || 'Sistema'}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No hay movimientos registrados para este producto.
                </div>
              )}
            </div>
            <div className="p-4 border-t text-right">
              <button
                onClick={() => setProductoSeleccionado(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};