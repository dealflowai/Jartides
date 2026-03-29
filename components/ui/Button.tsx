import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "fill" | "blue" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

type ButtonBaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<Variant, string> = {
  fill: "bg-[#0b3d7a] text-white hover:bg-[#09326a]",
  blue: "bg-[#1a6de3] text-white hover:bg-[#155ec7]",
  ghost:
    "border-[1.5px] border-[#0b3d7a] text-[#0b3d7a] hover:bg-[#0b3d7a] hover:text-white",
  white: "bg-white text-[#0b3d7a] hover:bg-[#f0f4fa]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-7 py-3 text-sm",
  lg: "px-10 py-4 text-base",
};

export default function Button({
  variant = "fill",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-lg font-semibold font-[family-name:var(--font-body)] hover-scale",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const buttonRest = rest as Omit<ButtonAsButton, keyof ButtonBaseProps>;
  return (
    <button className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
