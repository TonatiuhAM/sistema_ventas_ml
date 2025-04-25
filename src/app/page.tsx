"use client";

import Link from "next/link";
import { FaBoxOpen, FaListAlt, FaCashRegister, FaUsers, FaUserCog, FaSignInAlt, FaSignOutAlt, FaUser, FaUtensils } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  // Obtener la sesión del usuario
  const { data: session, status } = useSession();
  
  // Función para manejar cierre de sesión
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
  // Determinar qué módulos puede ver el usuario según su rol
  const userRole = session?.user?.role;
  const canAccessInventory = userRole === "Administrador";
  const canAccessCatalogs = userRole === "Administrador";
  const canAccessPersonas = userRole === "Administrador";
  const canAccessUsuarios = userRole === "Administrador";
  const canAccessPos = true; // Todos los roles pueden acceder al punto de venta
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 text-white p-4">
      <div className="container max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sistema de Ventas ML</h1>
          <p className="text-xl opacity-80">Panel de Administración</p>
          
          {/* Mostrar información de sesión y botón de cerrar sesión SOLO cuando hay una sesión activa */}
          {session && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Mostrar información del usuario cuando hay sesión */}
              <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">
                <FaUser className="mr-2" />
                <span>
                  Usuario: <strong>{session.user?.name || session.user?.email}</strong>
                  {session.user?.role && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-900 text-xs rounded-full">
                      {session.user.role}
                    </span>
                  )}
                </span>
              </div>
              
              {/* Botón de cerrar sesión */}
              <button 
                onClick={handleSignOut} 
                className="inline-flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
              >
                <FaSignOutAlt className="mr-2" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </header>

        {session ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Solo mostrar el enlace a inventario si tiene permiso */}
            {canAccessInventory && (
              <Link 
                href="/inventory" 
                className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
              >
                <FaBoxOpen className="text-5xl mb-4" />
                <h2 className="text-2xl font-semibold">Inventario</h2>
                <p className="text-sm mt-2 text-center opacity-80">Gestiona productos y existencias</p>
              </Link>
            )}

            {/* Solo mostrar el enlace a catálogos si tiene permiso */}
            {canAccessCatalogs && (
              <Link 
                href="/catalogs" 
                className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
              >
                <FaListAlt className="text-5xl mb-4" />
                <h2 className="text-2xl font-semibold">Catálogos</h2>
                <p className="text-sm mt-2 text-center opacity-80">Administra categorías y datos maestros</p>
              </Link>
            )}

            {/* Solo mostrar el enlace a personas si tiene permiso */}
            {canAccessPersonas && (
              <Link 
                href="/personas" 
                className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
              >
                <FaUsers className="text-5xl mb-4" />
                <h2 className="text-2xl font-semibold">Personas</h2>
                <p className="text-sm mt-2 text-center opacity-80">Gestiona clientes y proveedores</p>
              </Link>
            )}

            {/* Punto de venta estándar */}
            <Link 
              href="/pos" 
              className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
            >
              <FaCashRegister className="text-5xl mb-4" />
              <h2 className="text-2xl font-semibold">Punto de Venta</h2>
              <p className="text-sm mt-2 text-center opacity-80">Registra ventas y transacciones</p>
            </Link>

            {/* Punto de venta de restaurante */}
            <Link 
              href="/restaurant" 
              className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
            >
              <FaUtensils className="text-5xl mb-4" />
              <h2 className="text-2xl font-semibold">Restaurante</h2>
              <p className="text-sm mt-2 text-center opacity-80">Gestión de mesas y órdenes</p>
            </Link>

            {/* Solo mostrar el enlace a usuarios si tiene permiso */}
            {canAccessUsuarios && (
              <Link 
                href="/usuarios" 
                className="bg-white/10 hover:bg-white/20 p-8 rounded-xl flex flex-col items-center justify-center transition-all transform hover:scale-105"
              >
                <FaUserCog className="text-5xl mb-4" />
                <h2 className="text-2xl font-semibold">Usuarios</h2>
                <p className="text-sm mt-2 text-center opacity-80">Administra usuarios y permisos</p>
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center p-10 bg-white/10 rounded-xl">
            <p className="mb-6 text-xl">Bienvenido al Sistema de Ventas ML</p>
            <p className="mb-8">Inicia sesión para acceder a las funcionalidades del sistema</p>
            <Link 
              href="/login"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg transition-all font-medium text-lg"
            >
              <FaSignInAlt className="mr-3" />
              Iniciar Sesión
            </Link>
          </div>
        )}

        <footer className="mt-16 text-center">
          <p className="opacity-60">© {new Date().getFullYear()} Sistema de Ventas ML</p>
        </footer>
      </div>
    </main>
  );
}
