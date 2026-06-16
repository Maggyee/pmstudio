import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#94d8ff] focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-[#101010] hover:shadow-[0_18px_42px_rgba(0,0,0,0.22)]",
        secondary:
          "liquid-glass text-black hover:-translate-y-0.5 hover:bg-white/75",
        ghost: "text-[#6a6b6c] hover:bg-white/55 hover:text-black",
        accent: "bg-[#12a7ff] text-white shadow-[0_12px_30px_rgba(18,167,255,0.22)] hover:-translate-y-0.5 hover:bg-[#0097ed]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
