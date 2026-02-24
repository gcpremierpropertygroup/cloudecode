import { cn } from "@/lib/utils/cn";

export default function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-gold text-xs font-bold tracking-[3px] uppercase",
        className
      )}
    >
      {children}
    </p>
  );
}
