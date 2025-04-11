"use client";

import { useState } from "react";
import { useInventory } from "~/hooks/useInventory";
import { v4 as uuidv4 } from "uuid";
import { string } from "zod";

export const FormularioProductos = ({ onSuccess }: { onSuccess: () => void }) => {
  const { create } = useInventory();
  const [form, setForm] = useState({ id: "", nombre: "", categoriasProductosId: "", proveedorId: "" , estadosId:""});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!form.nombre || !form.categoriasProductosId || !form.proveedorId) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }
  
    await create.mutateAsync({
      ...form,
      id: uuidv4(),
      estadosId: "default_estado_id",
    });
    onSuccess();
    setForm({ id: "", nombre: "", categoriasProductosId: "", proveedorId: "", estadosId: "" });
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nombre del producto"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="input"
      />
      <button type="submit" className="btn btn-primary">
        Guardar
      </button>
    </form>
  );
};