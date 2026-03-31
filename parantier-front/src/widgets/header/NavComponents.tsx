import * as React from "react";

/* ────────────────────────────────────────────
   NavInput - 헤더 전용 Input
──────────────────────────────────────────── */
export interface NavInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  rightElement?: React.ReactNode;
}

export const NavInput = React.forwardRef<HTMLInputElement, NavInputProps>(
  ({ className = "", rightElement, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          {...props}
          className={`h-9 w-48 rounded-md px-3 text-sm text-white placeholder-white/50 bg-white/10 outline-none focus:bg-white/15 transition-colors ${className}`}
          style={{ border: "1px solid white", ...props.style }}
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

/* ────────────────────────────────────────────
   NavButton - 헤더 전용 Button
──────────────────────────────────────────── */
export interface NavButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
}

export const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const base =
      "h-9 px-3 rounded-md text-sm font-medium transition-colors outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      ghost: "bg-transparent text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] hover:bg-white/10",
    };

    return (
      <button
        ref={ref}
        {...props}
        className={`${base} ${variants[variant]} ${className}`}
        style={{ border: "1px solid white", ...props.style }}
      >
        {children}
      </button>
    );
  }
);
NavButton.displayName = "NavButton";
