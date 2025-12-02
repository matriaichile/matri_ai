import type { Metadata } from "next";
import { Playfair_Display, Lato, Cinzel } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matri.AI - Matchmaking Inteligente para Bodas",
  description: "Conectamos novios con los mejores proveedores para su boda ideal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${playfair.variable} ${lato.variable} ${cinzel.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
