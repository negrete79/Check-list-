
import React, { useEffect, useState } from 'react';
import { IconSparkles } from './Icons';

interface SplashProps {
  onFinish: () => void;
}

const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2500);
    const finishTimer = setTimeout(onFinish, 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[200] bg-[#0a0f1d] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full animate-pulse"></div>
        <div className="relative w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-bounce">
          <IconSparkles className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h1 className="text-4xl font-black font-lexend tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
          InnCheck<span className="text-emerald-500">.</span>
        </h1>
        <p className="text-emerald-500/60 font-bold text-xs uppercase tracking-[0.4em] animate-pulse">
          Inteligência Operacional
        </p>
      </div>

      <div className="absolute bottom-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 animate-[loading_2.5s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Splash;
