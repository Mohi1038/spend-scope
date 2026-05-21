import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-purple-600 text-white shadow-[0_4px_15px_rgba(168,85,247,0.2)] hover:bg-purple-500",
        gradient:
          "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.25)] hover:from-purple-500 hover:to-cyan-400 hover:shadow-[0_4px_25px_rgba(168,85,247,0.35)]",
        outline:
          "border border-white/10 bg-transparent text-gray-200 hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white",
        ghost:
          "bg-transparent text-gray-300 hover:bg-white/5 hover:text-white",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3",
        lg: "h-14 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
