import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white/70 backdrop-blur-xl rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
