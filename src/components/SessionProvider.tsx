"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { type ReactNode } from "react";

// Componente para gestionar la sesión al iniciar el sistema
function SessionResetter() {
  const { data: session } = useSession();
  
  useEffect(() => {
    // Solo ejecutar al montar el componente por primera vez
    if (!session) return;
    
    // Verificamos si este es un inicio fresco del sistema
    const isSystemStart = sessionStorage.getItem('systemSession') === null;
    
    if (isSystemStart) {
      // Si es un inicio fresco del sistema, establecer la bandera y cerrar sesión
      sessionStorage.setItem('systemSession', 'active');
      
      // Pequeño retraso para permitir que la página se cargue completamente
      const timer = setTimeout(() => {
        // Solo cerramos sesión si es un inicio de sistema fresco
        signOut({ redirect: false });
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // Si no es un inicio fresco, simplemente actualizamos el tiempo de actividad
      sessionStorage.setItem('lastActivity', new Date().toISOString());
    }
    
    // Establecer un intervalo para verificar inactividad prolongada (8 horas)
    const checkInactivity = setInterval(() => {
      const lastActivity = sessionStorage.getItem('lastActivity');
      if (lastActivity) {
        const inactiveTime = new Date().getTime() - new Date(lastActivity).getTime();
        // Si han pasado más de 8 horas, cerrar sesión
        if (inactiveTime > 8 * 60 * 60 * 1000) {
          signOut({ redirect: false });
          sessionStorage.removeItem('systemSession');
        }
      }
    }, 60 * 1000); // Verificar cada minuto
    
    return () => {
      clearInterval(checkInactivity);
    };
  }, [session]);
  
  // Si hay una sesión activa, actualizar el tiempo de actividad al interactuar
  useEffect(() => {
    if (!session) return;
    
    const updateActivity = () => {
      sessionStorage.setItem('lastActivity', new Date().toISOString());
    };
    
    // Actualizar al interactuar con la página
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
    };
  }, [session]);
  
  return null;
}

type SessionProviderProps = {
  children: ReactNode;
  refetchOnWindowFocus?: boolean;
};

export function SessionProvider({ 
  children,
  refetchOnWindowFocus = true 
}: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      // Configuración para que la sesión no se mantenga automáticamente
      refetchInterval={0} // No refrescar automáticamente
      refetchOnWindowFocus={refetchOnWindowFocus} // No refrescar al volver a la ventana
    >
      <SessionResetter />
      {children}
    </NextAuthSessionProvider>
  );
}