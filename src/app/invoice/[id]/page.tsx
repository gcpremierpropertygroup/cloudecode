import type { Metadata } from "next";
import { getConfig } from "@/lib/admin/config";
import type { Invoice } from "@/types/booking";
import InvoicePageClient from "./InvoicePageClient";

export const metadata: Metadata = {
  title: "Invoice | G|C Premier Property Group",
};

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { id } = await params;
  const { paid } = await searchParams;
  const invoice = await getConfig<Invoice | null>(`invoice:${id}`, null);

  return <InvoicePageClient invoice={invoice} justPaid={paid === "true"} />;
}
