import { cn } from "@/lib/utils/cn";

export default function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("w-[60px] h-[3px] bg-gold my-6", className)} />
  );
}
