import type { Metadata } from "next";
import KrishnaClient from "./KrishnaClient";

export const metadata: Metadata = {
  title: "Krishna — Physician / Sound Explorer / Analog Soul",
  description:
    "Physician by day, sound explorer by night. Analog photography, modular synthesis, and tennis.",
};

export default function KrishnaPage() {
  return <KrishnaClient />;
}
