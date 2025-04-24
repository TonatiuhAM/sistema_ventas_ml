import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from "~/components/SessionProvider";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Sistema de Ventas ML",
  description: "Sistema de punto de venta y gestión de inventario",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <SessionProvider refetchOnWindowFocus={false}>
            {children}
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
