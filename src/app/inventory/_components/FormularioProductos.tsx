"use client";

import { useState, useEffect } from "react";
import { useInventory } from "~/hooks/useInventory";
import { v4 as uuidv4 } from "uuid";

export const FormularioProductos = ({ onSuccess }: { onSuccess: () => void }) => {
  const { create, fetchCategorias, fetchProveedores, fetchEstados, fetchUbicaciones } = useInventory();
  const [form, setForm] = useState({
    id: "",
    nombre: "",
    categoriasProductosId: "",
    proveedorId: "",
    estadosId: "",
    precio: "",
    // Nuevos campos para inventario
    ubicacionId: "",
    cantidadActual: "",
    cantidadMaxima: "",
    cantidadMinima: "",
  });
  const [categorias, setCategorias] = useState<{ id: string; categoria: string }[]>([]);
  const [proveedores, setProveedores] = useState<{ id: string; nombre: string }[]>([]);
  const [estados, setEstados] = useState<{ id: string; estado: string }[]>([]);
  const [ubicaciones, setUbicaciones] = useState<{ id: string; nombre: string; ubicacion: string }[]>([]);

  useEffect(() => {
    // Cargar categorías, proveedores, estados y ubicaciones desde la base de datos
    const fetchData = async () => {
      if (fetchCategorias.data) setCategorias(fetchCategorias.data);
      if (fetchProveedores.data) setProveedores(fetchProveedores.data);
      if (fetchEstados.data) setEstados(fetchEstados.data);
      if (fetchUbicaciones.data) setUbicaciones(fetchUbicaciones.data);
    };
    fetchData();
  }, [fetchCategorias.data, fetchProveedores.data, fetchEstados.data, fetchUbicaciones.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (
      !form.nombre.trim() || 
      !form.categoriasProductosId || 
      !form.proveedorId || 
      !form.estadosId || 
      !form.precio || 
      !form.ubicacionId || 
      !form.cantidadActual || 
      !form.cantidadMaxima || 
      !form.cantidadMinima
    ) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      const productoId = uuidv4();
      console.log("Iniciando creación de producto con ID:", productoId);

      // Crear el producto, registrar el historial de precios y el inventario inicial
      const result = await create.mutateAsync({
        id: productoId,
        nombre: form.nombre,
        categoriasProductosId: form.categoriasProductosId,
        proveedorId: form.proveedorId,
        estadosId: form.estadosId,
        precio: parseFloat(form.precio),
        // Datos de inventario
        ubicacionId: form.ubicacionId,
        cantidadActual: parseInt(form.cantidadActual),
        cantidadMaxima: parseInt(form.cantidadMaxima),
        cantidadMinima: parseInt(form.cantidadMinima),
      });

      console.log("Resultado de la creación:", result);
      
      // Verificar si la operación fue exitosa
      if (result?.success) {
        alert("Producto guardado correctamente");
        onSuccess();
        setForm({
          id: "", 
          nombre: "", 
          categoriasProductosId: "", 
          proveedorId: "", 
          estadosId: "", 
          precio: "",
          ubicacionId: "",
          cantidadActual: "",
          cantidadMaxima: "",
          cantidadMinima: "",
        });
      } else {
        console.error("La operación no fue exitosa:", result);
        alert("No se pudo guardar el producto. Verifica los datos e intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error completo al crear el producto:", error);
      
      let errorMessage = "Ocurrió un error al guardar el producto.";
      
      // Intentar extraer un mensaje de error más específico
      if (error instanceof Error) {
        errorMessage += " " + error.message;
      } else if (typeof error === 'object' && error !== null) {
        const anyError = error as any;
        if (anyError.message) {
          errorMessage += " " + anyError.message;
        }
        
        // Si hay un error de la API de tRPC, podría tener detalles adicionales
        if (anyError.data?.zodError || anyError.shape?.message) {
          errorMessage += " Detalles: " + (anyError.data?.zodError?.message || anyError.shape?.message);
        }
      }
      
      alert(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Producto</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información básica del producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={form.categoriasProductosId}
            onChange={(e) => setForm({ ...form, categoriasProductosId: e.target.value })}
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
            value={form.proveedorId}
            onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
          <input
            type="number"
            placeholder="Precio del producto"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={form.estadosId}
            onChange={(e) => setForm({ ...form, estadosId: e.target.value })}
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
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Información de Inventario</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <select
            value={form.ubicacionId}
            onChange={(e) => setForm({ ...form, ubicacionId: e.target.value })}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Inicial</label>
          <input
            type="number"
            min="0"
            placeholder="Cantidad inicial"
            value={form.cantidadActual}
            onChange={(e) => setForm({ ...form, cantidadActual: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Mínima</label>
          <input
            type="number"
            min="0"
            placeholder="Cantidad mínima"
            value={form.cantidadMinima}
            onChange={(e) => setForm({ ...form, cantidadMinima: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Máxima</label>
          <input
            type="number"
            min="0"
            placeholder="Cantidad máxima"
            value={form.cantidadMaxima}
            onChange={(e) => setForm({ ...form, cantidadMaxima: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Guardar Producto
        </button>
      </div>
    </form>
  );
};