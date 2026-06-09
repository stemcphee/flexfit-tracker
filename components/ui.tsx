import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("card", className)}>{children}</section>;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <button
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-semibold tracking-tight",
        variant === "primary" && "bg-ink text-white",
        variant === "secondary" && "bg-mint text-ink",
        variant === "ghost" && "border border-ink/10 bg-white text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "good" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        tone === "default" && "bg-sand text-slate",
        tone === "good" && "bg-mint text-moss",
        tone === "warn" && "bg-amber/20 text-amber-900",
      )}
    >
      {children}
    </span>
  );
}
