import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-amber-800 text-white hover:bg-amber-900",
  secondary: "bg-stone-100 text-stone-900 hover:bg-stone-200",
  danger: "bg-red-700 text-white hover:bg-red-800",
  ghost: "bg-transparent text-stone-700 hover:bg-stone-100",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(({ className = "", variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={`${base} ${variantClasses[variant]} ${className}`}
    {...props}
  />
));
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variantClasses[variant]} ${className}`}>
      {children}
    </Link>
  );
}
