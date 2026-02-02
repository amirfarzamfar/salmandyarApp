"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PortalButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "calm";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export function PortalButton({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}: PortalButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-medical-500 to-medical-600 text-white hover:from-medical-600 hover:to-medical-700 shadow-lg shadow-medical-500/30 border-none",
    secondary: "bg-white text-medical-700 hover:bg-medical-50 border border-medical-100 shadow-soft-sm",
    outline: "bg-transparent border-2 border-medical-200 text-medical-600 hover:border-medical-300 hover:bg-medical-50/50",
    ghost: "bg-transparent text-medical-600 hover:bg-medical-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    calm: "bg-calm-green-100 text-calm-green-600 hover:bg-calm-green-200 border border-calm-green-200",
  };

  const sizes = {
    sm: "h-10 px-4 text-sm rounded-xl",
    md: "h-12 px-6 text-base rounded-2xl", // Min 48px touch target
    lg: "h-14 px-8 text-lg rounded-3xl w-full",
    icon: "h-12 w-12 rounded-2xl flex items-center justify-center p-0",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02, y: -1 }}
      disabled={disabled || isLoading}
      className={cn(
        "font-medium flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden",
        "focus:outline-none focus:ring-4 focus:ring-medical-200/50", // Softer focus ring
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </motion.button>
  );
}
