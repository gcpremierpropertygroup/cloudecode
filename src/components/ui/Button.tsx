"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  as?: "button" | "a";
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, as, href, ...props },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer";
    const variants = {
      primary:
        "bg-gold text-white hover:bg-gold-light active:bg-gold-dark",
      secondary:
        "bg-transparent text-white border-2 border-white/20 hover:border-gold hover:text-gold hover:bg-white/5",
      outline:
        "bg-transparent text-white/80 border-2 border-white/15 hover:border-gold hover:text-gold hover:bg-white/5",
    };
    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-sm",
    };

    const classes = cn(base, variants[variant], sizes[size], className);

    if (as === "a" && href) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
