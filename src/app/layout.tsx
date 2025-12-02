import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

// Tipografía display elegante para títulos
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

// Tipografía moderna y limpia para cuerpo
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Matri | Tu Boda de Ensueño",
  description: "Conectamos parejas con los mejores proveedores de bodas. Diseña la celebración perfecta con profesionales verificados.",
  keywords: ["bodas", "matrimonio", "proveedores de bodas", "wedding planner", "fotografía de bodas"],
  openGraph: {
    title: "Matri | Tu Boda de Ensueño",
    description: "Conectamos parejas con los mejores proveedores de bodas",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FAF8F5" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
