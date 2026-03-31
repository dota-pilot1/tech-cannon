import * as React from "react";

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      className = "",
      borderColor,
      bgColor,
      textColor,
      variant = "default",
      size = "md",
      style,
      children,
      ...props
    },
    ref
  ) => {
    const baseClass =
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

    const sizeClass = {
      sm: "h-8 px-2 text-xs",
      md: "h-9 px-3 text-sm",
      lg: "h-10 px-4 text-sm",
      icon: "h-9 w-9",
    }[size];

    const variantClass = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      ghost: "bg-transparent hover:bg-white/10",
      outline: "bg-transparent hover:bg-white/10",
    }[variant];

    const inlineStyle: React.CSSProperties = {
      ...style,
      ...(borderColor && { border: `1px solid ${borderColor}` }),
      ...(bgColor && { background: bgColor }),
      ...(textColor && { color: textColor }),
    };

    return (
      <button
        ref={ref}
        {...props}
        className={`${baseClass} ${sizeClass} ${variantClass} ${className}`}
        style={inlineStyle}
      >
        {children}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";
