"use client";

import { AdminPersonas } from "./_components/AdminPersonas";

const PersonasPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Personas</h1>
      <AdminPersonas />
    </div>
  );
};

export default PersonasPage;