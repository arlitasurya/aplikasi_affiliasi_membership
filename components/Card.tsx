
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({ children, title, subtitle, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
