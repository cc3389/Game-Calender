import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm",
        variant === "primary" &&
          "bg-violet-600 text-white hover:bg-violet-500",
        variant === "ghost" &&
          "text-zinc-300 hover:bg-white/10 hover:text-white",
        variant === "outline" &&
          "border border-zinc-600 text-zinc-200 hover:border-zinc-400",
        className,
      )}
      {...props}
    />
  );
}
