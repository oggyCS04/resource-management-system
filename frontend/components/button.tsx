import React from 'react';

interface ButtonProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    label,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    icon,
}) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

    const sizeClasses = {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-11 px-5 text-sm gap-2",
    };

    const variantClasses = {
        primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/20",
        secondary: "bg-muted text-foreground hover:bg-accent",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm shadow-destructive/20",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        outline: "border border-border bg-card text-foreground hover:bg-muted",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {label}
        </button>
    );
};

export const EditButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <Button label="Edit" variant="secondary" size="sm" onClick={onClick} />
);

export const DeleteButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <Button
        label="Delete"
        variant="ghost"
        size="sm"
        onClick={onClick}
    />
);

export const SaveButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <Button label="Save" variant="primary" size="sm" onClick={onClick} />
);

export default Button;