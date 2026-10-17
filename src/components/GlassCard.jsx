import React from 'react';

export default function GlassCard({ children, className = '', hover = false, ...rest }) {
  return (
    <div
      className={`glass rounded-[24px] ${
        hover ? 'transition-all duration-300 hover:bg-white/[0.14] hover:-translate-y-1' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
