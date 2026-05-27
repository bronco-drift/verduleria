import type { Metadata } from "next";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { TopTabs } from "@/components/layout/top-tabs";
import { listActiveStores, getActiveStore } from "@/lib/active-store";
import "./globals.css";

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

  // Try to resolve the active store. If none exist, fall back to empty UI.
  let stores: { slug: string; name: string }[] = [];
  let currentSlug = "";
  try {
    const all = await listActiveStores();
    stores = all.map((s) => ({ slug: s.slug, name: s.name }));
    if (stores.length) {
      const active = await getActiveStore();
      currentSlug = active.slug;
    }
  } catch {
    // No stores — admin menu will show empty state
  }

  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TopTabs
          pathname={pathname}
          stores={stores}
          currentSlug={currentSlug}
        />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
