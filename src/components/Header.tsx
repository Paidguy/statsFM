import React from 'react';

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="w-full border-b border-[#18203a] px-6 py-4 flex items-center justify-between">
      <button 
        type="button"
        onClick={onReset}
        aria-label="statsFM home"
        className="flex items-center gap-3 cursor-pointer select-none group min-touch-target bg-transparent border-0 p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fd6c6]"
      >
        {/* Overlapping screen-blended ink circles mark */}
        <div className="relative w-7 h-7 flex items-center">
          <div 
            className="absolute left-0 w-5 h-5 rounded-full bg-[#ff5c9a] opacity-90 risograph-blend"
            aria-hidden="true"
          />
          <div 
            className="absolute left-2.5 w-5 h-5 rounded-full bg-[#3fd6c6] opacity-90 risograph-blend"
            aria-hidden="true"
          />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#f1ebdc] heading-bricolage">
          statsFM
        </span>
      </button>
      <div className="text-xs text-[#98a1ba] hidden sm:block">
        Music taste &amp; listening stats
      </div>
    </header>
  );
};
