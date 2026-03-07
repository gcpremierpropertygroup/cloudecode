import type { Metadata } from "next";
import { getConfig, setConfig } from "@/lib/admin/config";
import type { Contract } from "@/types/booking";
import ContractPageClient from "./ContractPageClient";

export const metadata: Metadata = {
  title: "Contract | G|C Premier Property Group",
};

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getConfig<Contract | null>(`contract:${id}`, null);

  // Mark as viewed on first view
  if (contract && contract.status === "sent") {
    contract.status = "viewed";
    contract.viewedAt = new Date().toISOString();
    await setConfig(`contract:${id}`, contract);
  }

  return <ContractPageClient contract={contract} />;
}
