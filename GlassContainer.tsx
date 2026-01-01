
import React from 'react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass rounded-3xl p-6 
        transition-all duration-300 ease-out
        ${hover ? 'hover:bg-white/[0.06] hover:scale-[1.01] hover:border-white/30' : ''}
        ${onClick ? 'cursor-pointer active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassContainer;
