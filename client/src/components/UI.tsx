import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

type CardProps = {
    children: ReactNode;
    className?: string;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
};

type BadgeProps = {
    children: ReactNode;
    color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'pink';
};

export const Card = ({ children, className = '' }: CardProps) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 ${className}`}>
        {children}
    </div>
);

export const Button = ({ children, className = '', variant = 'primary', disabled = false, ...props }: ButtonProps) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
    };
    return (
        <button
            disabled={disabled}
            className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${props.className || ''}`}
    />
);

export const Badge = ({ children, color = 'blue' }: BadgeProps) => {
    const colors = {
        blue: "bg-blue-100 text-blue-700 border-blue-200",
        green: "bg-green-100 text-green-700 border-green-200",
        red: "bg-red-100 text-red-700 border-red-200",
        purple: "bg-purple-100 text-purple-700 border-purple-200",
        orange: "bg-orange-100 text-orange-700 border-orange-200",
        pink: "bg-pink-100 text-pink-700 border-pink-200"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color as keyof typeof colors]}`}>
            {children}
        </span>
    );
};

