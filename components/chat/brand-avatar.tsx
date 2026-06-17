import { getInitials, theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type BrandAvatarProps = {
  className?: string;
};

export function BrandAvatar({ className }: BrandAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-bold text-accent-fg",
        className
      )}
      aria-hidden
    >
      {theme.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={theme.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        getInitials(theme.botName)
      )}
    </div>
  );
}
