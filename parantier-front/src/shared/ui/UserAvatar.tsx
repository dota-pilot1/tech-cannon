import { cn } from "@/shared/lib/utils";

interface UserAvatarProps {
  user?: {
    username?: string | null;
    profileImageUrl?: string | null;
  } | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-24 h-24 text-2xl",
};

// Modern, sophisticated color palettes
const colorGradients = [
  "from-slate-600 to-slate-800",     // Professional
  "from-indigo-500 to-indigo-700",   // Brand
  "from-emerald-500 to-emerald-700", // Success
  "from-blue-500 to-blue-700",       // Corporate
  "from-violet-500 to-violet-700",   // Creative
  "from-rose-500 to-rose-700",       // Passion
];

export function UserAvatar({ user, className, size = "md" }: UserAvatarProps) {
  if (user?.profileImageUrl) {
    return (
      <div className={cn("rounded-full overflow-hidden border border-border/50 shadow-sm grow-0 shrink-0", sizeClasses[size], className)}>
        <img
          src={user.profileImageUrl}
          alt={user.username || "User"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const firstLetter = user?.username?.[0]?.toUpperCase() || "?";
  
  // Choose color based on username hash
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const hash = getHash(user?.username || "Guest");
  const gradientClass = colorGradients[hash % colorGradients.length];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shadow-sm transition-all grow-0 shrink-0 select-none",
        "bg-gradient-to-br",
        gradientClass,
        sizeClasses[size],
        className
      )}
    >
      {firstLetter}
    </div>
  );
}
