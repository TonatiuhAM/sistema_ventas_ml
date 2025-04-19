"use client";

import { useState, useEffect } from "react";
import { useInventory } from "~/hooks/useInventory";

export const MovimientoInventario = ({ onSuccess }: { onSuccess: () => void }) => {
  const { registrarMovimiento, fetchUbicaciones, getInventarioActual, fetchTipoMovimientos } = useInventory();
  const [productosFiltrados, setProductosFiltrados] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [tipoMovimientos, setTipoMovimientos] = useState<any[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  
  const [form, setForm] = useState({
    productoId: "",
    ubicacionId: "",
    tipoMovimientoId: "",
    cantidad: "",
    comentario: "",
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (fetchUbicaciones.data) setUbicaciones(fetchUbicaciones.data);
      if (fetchTipoMovimientos.data) setTipoMovimientos(fetchTipoMovimientos.data);
      if (getInventarioActual.data) {
        setInventario(getInventarioActual.data);
        setProductosFiltrados(getInventarioActual.data);
      }
    };
    fetchData();
  }, [fetchUbicaciones.data, fetchTipoMovimientos.data, getInventarioActual.data]);

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (busqueda.trim() === "") {
      setProductosFiltrados(inventario);
    } else {
      const filtered = inventario.filter(item => 
        item.producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setProductosFiltrados(filtered);
    }
  }, [busqueda, inventario]);

  const handleProductoSeleccionado = (inventarioItem: any) => {
    setForm({
      ...form,
      productoId: inventarioItem.producto.id,
      ubicacionId: inventarioItem.ubicacion.id
    });
    setBusqueda(inventarioItem.producto.nombre);
    setProductosFiltrados([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!form.productoId || !form.ubicacionId || !form.tipoMovimientoId || !form.cantidad) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      await registrarMovimiento.mutateAsync({
        productoId: form.productoId,
        ubicacionId: form.ubicacionId,
        tipoMovimientoId: form.tipoMovimientoId,
        cantidad: parseInt(form.cantidad),
        comentario: form.comentario || undefined,
      });

      alert("Movimiento registrado correctamente");
      onSuccess();
      setForm({
        productoId: "",
        ubicacionId: "",
        tipoMovimientoId: "",
        cantidad: "",
        comentario: "",
      });
      setBusqueda("");
      
      // Refrescar datos de inventario
      getInventarioActual.refetch();
    } catch (error) {
      console.error("Error al registrar el movimiento:", error);
      alert("Ocurrió un error al registrar el movimiento. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Movimiento de Inventario</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selección de producto */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-2 border rounded"
            onFocus={() => setProductosFiltrados(inventario)}
          />
          
          {/* Lista de productos filtrados */}
          {busqueda && productosFiltrados.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-b mt-1 max-h-60 overflow-y-auto">
              {productosFiltrados.map((item) => (
                <div
                  key={`${item.producto.id}-${item.ubicacion.id}`}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleProductoSeleccionado(item)}
                >
                  <div>{item.producto.nombre}</div>
                  <div className="text-xs text-gray-600">
                    <span className="mr-2">Stock: {item.inventario.cantidadDisponible}</span>
                    <span>Ubicación: {item.ubicacion.nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {busqueda && productosFiltrados.length === 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-b mt-1 p-2 text-gray-500">
              No hay productos que coincidan con la búsqueda
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
            <select
              value={form.tipoMovimientoId}
              onChange={(e) => setForm({ ...form, tipoMovimientoId: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Seleccione tipo de movimiento</option>
              {tipoMovimientos
                .filter(tipo => ["COMPRA", "VENTA", "ENTRADA", "SALIDA"].includes(tipo.movimiento))
                .map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.movimiento}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input
              type="number"
              min="1"
              placeholder="Cantidad"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Comentario (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comentario (opcional)</label>
          <textarea
            placeholder="Comentario adicional sobre este movimiento"
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            className="w-full p-2 border rounded"
            rows={2}
          ></textarea>
        </div>

        {/* Información del producto seleccionado */}
        {form.productoId && (
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-gray-800 mb-1">Información del producto</h4>
            {inventario
              .filter(item => item.producto.id === form.productoId)
              .map((item) => (
                <div key={`info-${item.producto.id}`} className="text-sm">
                  <p>
                    <span className="font-medium">Producto:</span> {item.producto.nombre}
                  </p>
                  <p>
                    <span className="font-medium">Ubicación:</span> {item.ubicacion.nombre} - {item.ubicacion.ubicacion}
                  </p>
                  <p>
                    <span className="font-medium">Stock actual:</span> {item.inventario.cantidadDisponible}
                  </p>
                </div>
              ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={registrarMovimiento.isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {registrarMovimiento.isPending ? "Registrando..." : "Registrar Movimiento"}
          </button>
        </div>
      </form>
    </div>
  );
};