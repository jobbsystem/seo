import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10',
  secondary: 'rounded-full bg-white/95 backdrop-blur-xl text-slate-900 hover:bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.14),0_10px_24px_rgba(15,23,42,0.12)] hover:shadow-[inset_0_0_0_1px_rgba(15,23,42,0.2),0_12px_28px_rgba(15,23,42,0.14)]',
  ghost: 'rounded-full bg-transparent text-slate-600 hover:bg-slate-900/5'
};

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const { style, ...rest } = props;
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98] ${variantClasses[variant]} ${className}`}
      style={{ outline: 'none', ...style }}
      {...rest}
    />
  );
};

export default Button;
