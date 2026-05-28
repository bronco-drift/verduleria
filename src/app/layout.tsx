import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verdulería Online · Panel de Gestión",
  description: "Herramienta de análisis de precios, márgenes y logística",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
