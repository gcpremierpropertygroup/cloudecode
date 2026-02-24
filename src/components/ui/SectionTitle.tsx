import { cn } from "@/lib/utils/cn";

export default function SectionTitle({
  children,
  className,
  light = false,
}: {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <h2
      className={cn(
        "font-serif text-3xl md:text-4xl font-semibold",
        light ? "text-white" : "text-white",
        className
      )}
    >
      {children}
    </h2>
  );
}
