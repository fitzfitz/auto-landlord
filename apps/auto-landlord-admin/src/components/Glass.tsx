import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className }: GlassCardProps) => {
  return <div className={cn("glass-card", className)}>{children}</div>;
};

export const GlassButton = ({ children, className, ...props }: any) => {
  return (
    <button className={cn("glass-button", className)} {...props}>
      {children}
    </button>
  );
};
