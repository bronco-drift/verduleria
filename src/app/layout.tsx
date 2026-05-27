import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { TopTabs } from "@/components/layout/top-tabs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verdulería",
  description: "Sistema de gestión y tienda online de frutas y verduras.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-next-pathname") ?? "/";

  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TopTabs pathname={pathname} />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
