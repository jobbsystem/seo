import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', showDot = false }) => {
  return (
    <span
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-[11px] font-semibold leading-none text-center ${className}`}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
      {children}
    </span>
  );
};

export default Badge;
