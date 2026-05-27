import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/lib/tenant";
import { StoreHeader } from "@/components/storefront/store-header";

type Params = Promise<{ storeSlug: string }>;

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug);
  if (!store) notFound();

  return (
    <>
      <StoreHeader store={store} />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6">
        {children}
      </main>
    </>
  );
}
