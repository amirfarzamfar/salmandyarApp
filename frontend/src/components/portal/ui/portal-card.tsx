"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface PortalCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "highlight" | "calm";
  noPadding?: boolean;
}

export function PortalCard({ 
  children, 
  className, 
  variant = "default", 
  noPadding = false,
  ...props 
}: PortalCardProps) {
  const variants = {
    default: "bg-white border-none shadow-soft-lg hover:shadow-soft-xl transition-shadow duration-500",
    glass: "glass-card hover:shadow-glow-medical transition-shadow duration-500",
    highlight: "bg-medical-50/80 backdrop-blur-sm border border-medical-100 shadow-soft-sm",
    calm: "bg-calm-green-50/80 backdrop-blur-sm border border-calm-green-100 shadow-soft-sm",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-[32px] overflow-hidden", // Increased rounding for friendlier look
        variants[variant],
        noPadding ? "p-0" : "p-6 md:p-8", // Increased padding for breathability
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
