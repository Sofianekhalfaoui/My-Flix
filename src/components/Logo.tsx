import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 group cursor-pointer ${className}`}>
      <div className="relative">
        {/* Intense Red Glow behind the letters */}
        <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        
        {/* MF Letters with shadow/glow */}
        <div className="relative flex items-baseline transition-transform duration-300 group-hover:scale-110">
           <span className="text-4xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.9)]">M</span>
           <span className="text-4xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.9)] -ml-2">F</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-2xl font-black italic uppercase tracking-tighter leading-none text-white group-hover:text-red-500 transition-colors">MY FLIX</span>
        <div className="h-0.5 w-full bg-red-600/20 group-hover:bg-red-600 transition-all duration-500 mt-1"></div>
      </div>
    </div>
  );
};

export default Logo;
