import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matri.AI | Tu Boda Perfecta",
  description: "Conectamos parejas con los mejores proveedores de bodas a través de matchmaking inteligente. Encuentra fotógrafos, banquetería, DJ y más para tu día especial.",
  keywords: ["bodas", "matrimonio", "proveedores", "wedding planner", "fotógrafo bodas", "banquetería", "DJ bodas"],
  openGraph: {
    title: "Matri.AI | Tu Boda Perfecta",
    description: "Conectamos parejas con los mejores proveedores de bodas a través de matchmaking inteligente.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
