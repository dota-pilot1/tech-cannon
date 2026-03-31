import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  borderColor?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, borderColor, style, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        style={
          borderColor ? { ...style, border: `1px solid ${borderColor}` } : style
        }
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
