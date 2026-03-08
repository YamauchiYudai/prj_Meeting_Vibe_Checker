import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95";

    const variants = {
        primary: "bg-gradient-premium text-white shadow-lg shadow-accent-cyan/20 hover:shadow-accent-cyan/40 hover:-translate-y-0.5",
        secondary: "bg-background-alt text-white border border-white/10 hover:bg-white/5",
        outline: "border-2 border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan hover:text-white",
        ghost: "text-white/70 hover:text-white hover:bg-white/5",
        danger: "bg-emotion-angry text-white hover:opacity-90",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-8 py-3.5 text-lg",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            {children}
        </button>
    );
};

export const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => {
    return (
        <div className={cn("glass rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/20", className)}>
            {children}
        </div>
    );
};

export const Badge = ({ children, className, variant = 'neutral' }: { children: React.ReactNode, className?: string, variant?: string }) => {
    const variantStyles: Record<string, string> = {
        happy: "bg-emotion-happy/20 text-emotion-happy border-emotion-happy/30",
        sad: "bg-emotion-sad/20 text-emotion-sad border-emotion-sad/30",
        angry: "bg-emotion-angry/20 text-emotion-angry border-emotion-angry/30",
        neutral: "bg-white/10 text-white/70 border-white/20",
        surprised: "bg-emotion-surprised/20 text-emotion-surprised border-emotion-surprised/30",
        fearful: "bg-emotion-fearful/20 text-emotion-fearful border-emotion-fearful/30",
        disgusted: "bg-emotion-disgusted/20 text-emotion-disgusted border-emotion-disgusted/30",
        active: "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30",
        ended: "bg-white/5 text-white/40 border-white/10",
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider",
            variantStyles[variant] || variantStyles.neutral,
            className
        )}>
            {children}
        </span>
    );
};

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = {
        sm: "h-6 w-6 border-2",
        md: "h-12 w-12 border-3",
        lg: "h-20 w-20 border-4",
    };
    return (
        <div className="flex justify-center items-center py-10">
            <div className={cn(
                "animate-spin rounded-full border-t-accent-cyan border-white/10",
                sizes[size]
            )} />
        </div>
    );
};
