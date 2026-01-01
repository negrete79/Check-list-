
import React from 'react';
import { UserRole } from '../types';
import GlassContainer from './GlassContainer';
import { IconSparkles } from './Icons';

interface LoginProps {
  onLogin: (role: UserRole, name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0a0f1d]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-[28px] mb-8 shadow-2xl shadow-emerald-500/30 transform rotate-12">
            <IconSparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-lexend mb-4 tracking-tighter text-white">
            InnCheck<span className="text-emerald-500">.</span>
          </h1>
          <p className="text-slate-500 text-lg uppercase font-bold tracking-[0.3em]">Gestão Administrativa</p>
        </div>

        <div className="max-w-sm mx-auto">
          <GlassContainer 
            hover 
            className="cursor-pointer group relative overflow-hidden h-72 flex flex-col justify-center text-center border-white/10 bg-white/[0.02]"
            onClick={() => onLogin(UserRole.ADMIN, 'Administrador')}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10 blur-3xl group-hover:opacity-30 transition-opacity`}></div>
            <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform border border-white/20`}>
              <span className="text-white font-black text-4xl">A</span>
            </div>
            <h3 className="text-2xl font-black font-lexend text-white">Acessar Painel</h3>
            <p className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-widest px-6">Controle Total da Propriedade e Vistorias</p>
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default Login;
