
import React from 'react';
import { Room, RoomStatus } from '../types';
import GlassContainer from './GlassContainer';
import { IconRoom, IconShare, IconDownload } from './Icons';

interface RoomListProps {
  rooms: Room[];
  onSelect: (room: Room) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, onSelect }) => {
  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case RoomStatus.OCCUPIED: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case RoomStatus.CLEANING: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case RoomStatus.MAINTENANCE: return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case RoomStatus.CHECK_OUT_PENDING: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'Disponível';
      case RoomStatus.OCCUPIED: return 'Ocupado';
      case RoomStatus.CLEANING: return 'Limpando';
      case RoomStatus.MAINTENANCE: return 'Manutenção';
      case RoomStatus.CHECK_OUT_PENDING: return 'Pendente';
      default: return String(status);
    }
  };

  const handleShare = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    // Fix: replaced .completed with .status === 'OK'
    const completedCount = room.tasks.filter(t => t.status === 'OK').length;
    const total = room.tasks.length;
    const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    
    const text = `*InnCheck - Sítio Recanto da Limeira*\n\n📍 Unidade: ${room.number}\n📋 Tipo: ${room.type}\n⭕ Status: ${getStatusLabel(room.status)}\n✅ Progresso da Vistoria: ${progress}% (${completedCount}/${total} itens)`;

    if (navigator.share) {
      navigator.share({
        title: `Status: ${room.number}`,
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("Resumo copiado para a área de transferência!");
    }
  };

  const handleDownload = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    const header = `RELATÓRIO DE VISTORIA - SÍTIO RECANTO DA LIMEIRA\n`;
    const subheader = `UNIDADE: ${room.number} | TIPO: ${room.type}\nSTATUS ATUAL: ${getStatusLabel(room.status)}\n`;
    const date = `DATA DE EMISSÃO: ${new Date().toLocaleString()}\n`;
    const separator = "==========================================\n";
    
    // Fix: replaced .completed with .status === 'OK'
    const body = room.tasks.map(t => `${t.status === 'OK' ? '[CONCLUÍDO]' : '[PENDENTE] '} ${t.title}`).join("\n");
    
    const content = header + subheader + date + separator + "\nCHECKLIST DETALHADO:\n" + body + "\n\n" + separator + "InnCheck Intelligent System";
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vistoria_${room.number.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <GlassContainer 
          key={room.id} 
          hover 
          className="cursor-pointer group flex flex-col justify-between border-white/5"
          onClick={() => onSelect(room)}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-all duration-500">
                <IconRoom className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-lexend">{room.number}</h3>
                <p className="text-sm text-slate-400">{room.type}</p>
              </div>
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${getStatusColor(room.status)}`}>
              {getStatusLabel(room.status)}
            </span>
          </div>

          <div className="flex justify-between items-end mt-4">
            <div>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Conformidade</p>
               <div className="flex gap-1.5">
                 {/* Fix: replaced .completed with .status === 'OK' */}
                 <div className={`h-1.5 w-6 rounded-full transition-all duration-700 ${room.tasks.length > 0 && room.tasks.every(t => t.status === 'OK') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}></div>
                 <div className={`h-1.5 w-6 rounded-full transition-all duration-700 ${room.tasks.some(t => t.status === 'OK') ? 'bg-emerald-500/40' : 'bg-white/10'}`}></div>
                 <div className={`h-1.5 w-6 rounded-full transition-all duration-700 ${room.tasks.length > 10 ? 'bg-blue-500/20' : 'bg-white/5'}`}></div>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => handleShare(e, room)}
                className="p-2.5 bg-white/5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                title="Compartilhar Relatório"
              >
                <IconShare className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => handleDownload(e, room)}
                className="p-2.5 bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                title="Baixar Checklist Completo"
              >
                <IconDownload className="w-4 h-4" />
              </button>
              <button className="ml-2 p-2.5 text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all">
                Abrir
              </button>
            </div>
          </div>
        </GlassContainer>
      ))}
    </div>
  );
};

export default RoomList;
