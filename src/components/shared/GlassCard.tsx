import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("glass-card", hover && "glass-hover", className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
);
GlassCard.displayName = "GlassCard";
