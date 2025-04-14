"use client";

import { useState, useEffect } from "react";
import { useInventory } from "~/hooks/useInventory";
import { v4 as uuidv4 } from "uuid";
import { string } from "zod";

export const FormularioProductos = ({ onSuccess }: { onSuccess: () => void }) => {
  const { create, fetchCategorias, fetchProveedores, fetchEstados } = useInventory();
  const [form, setForm] = useState({
    id: "",
    nombre: "",
    categoriasProductosId: "",
    proveedorId: "",
    estadosId: "",
    precio: "",
  });
  const [categorias, setCategorias] = useState<{ id: string; categoria: string }[]>([]);
  const [proveedores, setProveedores] = useState<{ id: string; nombre: string }[]>([]);
  const [estados, setEstados] = useState<{ id: string; estado: string }[]>([]);

  useEffect(() => {
    // Cargar categorías, proveedores y estados desde la base de datos
    const fetchData = async () => {
      if (fetchCategorias.data) setCategorias(fetchCategorias.data);
      if (fetchProveedores.data) setProveedores(fetchProveedores.data);
      if (fetchEstados.data) setEstados(fetchEstados.data);
    };
    fetchData();
  }, [fetchCategorias.data, fetchProveedores.data, fetchEstados.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!form.nombre.trim() || !form.categoriasProductosId || !form.proveedorId || !form.estadosId || !form.precio) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      const productoId = uuidv4();
      const fechaActual = new Date();

      // Crear el producto y registrar el historial de precios
      await create.mutateAsync({
        id: productoId,
        nombre: form.nombre,
        categoriasProductosId: form.categoriasProductosId,
        proveedorId: form.proveedorId,
        estadosId: form.estadosId,
        precio: parseFloat(form.precio),
      });

      onSuccess();
      setForm({ id: "", nombre: "", categoriasProductosId: "", proveedorId: "", estadosId: "", precio: "" });
    } catch (error) {
      console.error("Error al crear el producto:", error);
      alert("Ocurrió un error al guardar el producto. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nombre del producto"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="input"
      />

      <select
        value={form.categoriasProductosId}
        onChange={(e) => setForm({ ...form, categoriasProductosId: e.target.value })}
        className="input"
      >
        <option value="">Selecciona una categoría</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.categoria}
          </option>
        ))}
      </select>

      <select
        value={form.proveedorId}
        onChange={(e) => setForm({ ...form, proveedorId: e.target.value })}
        className="input"
      >
        <option value="">Selecciona un proveedor</option>
        {proveedores.map((proveedor) => (
          <option key={proveedor.id} value={proveedor.id}>
            {proveedor.nombre}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Precio del producto"
        value={form.precio}
        onChange={(e) => setForm({ ...form, precio: e.target.value })}
        className="input"
      />

      <select
        value={form.estadosId}
        onChange={(e) => setForm({ ...form, estadosId: e.target.value })}
        className="input"
      >
        <option value="">Selecciona un estado</option>
        {estados.map((estado) => (
          <option key={estado.id} value={estado.id}>
            {estado.estado}
          </option>
        ))}
      </select>

      <button type="submit" className="btn btn-primary">
        Guardar
      </button>
    </form>
  );
};