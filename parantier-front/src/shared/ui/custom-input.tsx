import * as React from "react";

export interface CustomInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  rightElement?: React.ReactNode;
  borderColor?: string;
  bgColor?: string;
  textColor?: string;
}

export const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      className = "",
      rightElement,
      borderColor = "hsl(var(--border))",
      bgColor = "hsl(var(--background))",
      textColor = "hsl(var(--foreground))",
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          {...props}
          className={`h-9 w-full rounded-md px-3 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${rightElement ? "pr-9" : ""} ${className}`}
          style={{
            border: `1px solid ${borderColor}`,
            background: bgColor,
            color: textColor,
            ...style,
          }}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
