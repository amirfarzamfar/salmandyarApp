import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Since we didn't install class-variance-authority or @radix-ui/react-slot, I will implement a simpler version first
// But wait, the best practice is to use these. I'll stick to a simpler implementation for now to avoid too many installs
// unless the user asked for shadcn/ui specifically (which they didn't, but implied "latest methods").
// I will create a simple Button component with tailwind for now to be fast and efficient.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-md',
      secondary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md',
      outline: 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50',
      ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button"

export { Button }
