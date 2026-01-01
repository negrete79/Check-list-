
import React, { useState } from 'react';
import GlassContainer from './GlassContainer';
import { ttsService } from '../services/ttsService';

interface CheckOutFlowProps {
  guestName: string;
  onComplete: (signatureUri: string) => void;
  onCancel: () => void;
}

const CheckOutFlow: React.FC<CheckOutFlowProps> = ({ guestName, onComplete, onCancel }) => {
  const [step, setStep] = useState(0); 
  const [scanProgress, setScanProgress] = useState(0);

  const startCheckOut = () => {
    setStep(1);
    ttsService.speak("Finalizando estadia. Gerando relatório de encerramento Clara.");
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setScanProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep(2), 500);
      }
    }, 40);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#0a0f1d]/98 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <GlassContainer className="border-rose-500/30 py-10 px-8 text-center shadow-2xl relative">
          {step === 0 && (
            <div className="space-y-8 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-rose-500/20 rounded-[32px] flex items-center justify-center mx-auto border-2 border-rose-500/50 text-rose-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">ENCERRAR ESTADIA?</h3>
                <p className="text-slate-400 font-semibold text-sm">Hóspede: <span className="text-rose-400">{guestName}</span></p>
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pt-4">Um relatório de conformidade em PDF será gerado automaticamente.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={startCheckOut} className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-widest rounded-3xl shadow-xl active:scale-95 transition-all">Sim, Finalizar Agora</button>
                <button onClick={onCancel} className="w-full py-5 bg-white/5 text-slate-400 font-black uppercase tracking-widest rounded-3xl active:scale-95 transition-all">Cancelar</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 py-10 animate-in fade-in">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                  <circle className="text-rose-500 transition-all duration-300" strokeWidth="8" strokeDasharray={351} strokeDashoffset={351 - (351 * scanProgress) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">{Math.round(scanProgress)}%</div>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.5em] text-rose-400 animate-pulse">Sincronizando Clara AI...</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in zoom-in-95">
               <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500 shadow-2xl">
                  <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </div>
               <div className="space-y-3">
                 <h4 className="text-emerald-400 font-black uppercase tracking-widest text-xl">CONCLUÍDO</h4>
                 <p className="text-slate-300 text-sm px-4">Estadia encerrada. PDF gerado e unidade disponível para nova vistoria.</p>
               </div>
               <button onClick={() => onComplete('')} className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-3xl shadow-xl active:scale-95 transition-all">Voltar ao Painel</button>
            </div>
          )}
        </GlassContainer>
      </div>
    </div>
  );
};

export default CheckOutFlow;
