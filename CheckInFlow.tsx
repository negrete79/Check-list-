
import React, { useState, useRef, useEffect } from 'react';
import { GuestInfo } from '../types';
import GlassContainer from './GlassContainer';
import { IconCamera, IconSparkles } from './Icons';

interface CheckInFlowProps {
  roomType: string;
  onComplete: (guest: GuestInfo) => void;
  onCancel: () => void;
}

const CheckInFlow: React.FC<CheckInFlowProps> = ({ roomType, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestId, setGuestId] = useState('');
  const [idError, setIdError] = useState('');
  const [docPhoto, setDocPhoto] = useState<string | undefined>();
  const [facePhoto, setFacePhoto] = useState<string | undefined>();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanTimer, setScanTimer] = useState(10);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    let sum = 0; let rest;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(10, 11))) return false;
    return true;
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setGuestId(value);
    if (value.length > 0 && value.length < 11) setIdError('CPF incompleto');
    else if (value.length === 11 && !validateCPF(value)) setIdError('CPF inválido');
    else setIdError('');
  };

  const startCamera = async (isFront: boolean) => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: isFront ? 'user' : 'environment', width: { ideal: 600 }, height: { ideal: 600 } } 
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        setIsCameraReady(true);
      }
    } catch (err) { onCancel(); }
  };

  useEffect(() => {
    if (step === 2 || step === 3) {
      startCamera(step === 3);
      if (step === 3) setScanTimer(10);
    }
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [step]);

  useEffect(() => {
    let timer: number;
    if (step === 3 && isCameraReady && scanTimer > 0) {
      timer = window.setInterval(() => setScanTimer(prev => prev - 1), 1000);
    } else if (step === 3 && isCameraReady && scanTimer === 0) {
      capturePhoto();
    }
    return () => clearInterval(timer);
  }, [step, isCameraReady, scanTimer]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const size = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      canvas.width = 400; canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (step === 3) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
        ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
        const dataUri = canvas.toDataURL('image/jpeg', 0.8);
        if (step === 2) { setDocPhoto(dataUri); setStep(3); }
        else if (step === 3) { setFacePhoto(dataUri); setStep(4); }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0a0f1d]/98 backdrop-blur-3xl p-4 flex items-center justify-center overflow-y-auto">
      <div className="max-w-md w-full">
        <GlassContainer className="border-emerald-500/20 py-10 px-8 relative shadow-2xl rounded-[32px]">
          <button onClick={onCancel} className="absolute top-6 right-6 text-slate-500 p-2 hover:text-white transition-all">✕</button>
          
          <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-2xl mb-4 shadow-xl">
                <span className="text-2xl text-white">🏡</span>
             </div>
             <h3 className="text-xl font-black text-white uppercase tracking-tighter">Check-in Unidade</h3>
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4">
              <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Nome completo" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-emerald-500 text-sm" />
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={guestId} onChange={handleIdChange} placeholder="CPF (Somente números)" className={`w-full bg-white/5 border ${idError ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-5 py-4 text-white outline-none focus:border-emerald-500 text-sm font-mono`} />
              {idError && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-1 ml-1">{idError}</p>}
              <button disabled={!guestName || !guestId || !!idError || guestId.length < 11} onClick={() => setStep(2)} className="w-full py-4 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-widest disabled:opacity-20 transition-all shadow-lg active:scale-95 mt-2">Iniciar Vistoria</button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6 animate-in fade-in">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Foto do Documento (Quadrada)</p>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-white/10 bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none"></div>
              </div>
              <button onClick={capturePhoto} disabled={!isCameraReady} className="w-full py-4 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-widest active:scale-95 shadow-xl">Capturar Doc</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 animate-in fade-in">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Biometria Facial ({scanTimer}s)</p>
              <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-emerald-500/30 bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <span className="text-5xl font-black text-white/10">{scanTimer}</span>
                </div>
              </div>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] animate-pulse">Scan Automático Ativo</p>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-8 animate-in zoom-in-95 py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-xl text-emerald-400 text-2xl">✓</div>
              <h4 className="text-white font-black uppercase tracking-widest">Dados Validados</h4>
              <button onClick={() => onComplete({
                name: guestName, 
                documentId: guestId, 
                documentPhotoUri: docPhoto, 
                facePhotoUri: facePhoto, 
                checkInDate: Date.now(),
                checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              })} className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest shadow-xl active:scale-95">Finalizar Entrada</button>
            </div>
          )}
        </GlassContainer>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CheckInFlow;
