"use client";

import Link from "next/link";
import { FaBoxOpen, FaListAlt, FaCashRegister } from "react-icons/fa";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 text-white p-4">
      <div className="container max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sistema de Ventas ML</h1>
          <p className="text-xl opacity-80">Panel de Administración</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/inventory" 
            className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
          >
            <FaBoxOpen className="text-5xl mb-4" />
            <h2 className="text-2xl font-semibold">Inventario</h2>
            <p className="text-sm mt-2 text-center opacity-80">Gestiona productos y existencias</p>
          </Link>

          <Link 
            href="/catalogs" 
            className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
          >
            <FaListAlt className="text-5xl mb-4" />
            <h2 className="text-2xl font-semibold">Catálogos</h2>
            <p className="text-sm mt-2 text-center opacity-80">Administra categorías y datos maestros</p>
          </Link>

          <Link 
            href="/pos" 
            className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
          >
            <FaCashRegister className="text-5xl mb-4" />
            <h2 className="text-2xl font-semibold">Punto de Venta</h2>
            <p className="text-sm mt-2 text-center opacity-80">Registra ventas y transacciones</p>
          </Link>
        </div>

        <footer className="mt-16 text-center">
          <p className="opacity-60">© {new Date().getFullYear()} Sistema de Ventas ML</p>
        </footer>
      </div>
    </main>
  );
}
