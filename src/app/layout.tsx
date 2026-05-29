import type { Metadata, Viewport } from "next";

const SITE_URL = "https://verduras.ar";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "verduras.ar — Frutas, verduras y almacén con envío a domicilio",
    template: "%s · verduras.ar",
  },
  description:
    "Comprá frutas, verduras y almacén online en verduras.ar. Encontrá la verdulería más cercana, comparalas con la competencia y elegí delivery o retiro en local.",
  applicationName: "verduras.ar",
  keywords: [
    "verdulería online",
    "frutas y verduras delivery",
    "verduras a domicilio",
    "almacén online",
    "verduras CABA",
    "verduras GBA",
    "verduras Argentina",
    "bolsón de verduras",
  ],
  authors: [{ name: "verduras.ar" }],
  creator: "verduras.ar",
  publisher: "verduras.ar",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "verduras.ar",
    title: "verduras.ar — Frutas, verduras y almacén con envío",
    description:
      "Comprá online en la verdulería más cercana. Delivery o retiro, múltiples formas de pago.",
    images: [{ url: "/icon-512.svg", alt: "Logo de verduras.ar" }],
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: "verduras.ar — Frutas y verduras con envío",
    description:
      "Comprá online en la verdulería más cercana. Delivery o retiro, múltiples formas de pago.",
    images: ["/icon-512.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-512.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  category: "shopping",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2e5f7a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
