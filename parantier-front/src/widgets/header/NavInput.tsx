import * as React from "react";

export interface NavInputProps extends React.ComponentProps<"input"> {
  wrapperClassName?: string;
  rightElement?: React.ReactNode;
}

export const NavInput = React.forwardRef<HTMLInputElement, NavInputProps>(
  ({ className = "", wrapperClassName = "", rightElement, ...props }, ref) => {
    return (
      <div className={`relative flex items-center ${wrapperClassName}`}>
        <input
          ref={ref}
          {...props}
          className={`h-9 w-48 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/50 bg-white/10 outline-none transition-colors ${className}`}
          style={{
            border: "1px solid white",
            ...props.style,
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

NavInput.displayName = "NavInput";
