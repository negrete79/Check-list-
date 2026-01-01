
import React, { useState, useMemo, useEffect } from 'react';
import { Room, RoomStatus, Task, GuestInfo, TaskStatus } from '../types';
import GlassContainer from './GlassContainer';
import { IconEdit, IconTrash } from './Icons';
import CheckInFlow from './CheckInFlow';
import CheckOutFlow from './CheckOutFlow';
import { jsPDF } from 'jspdf';

interface RoomDetailProps {
  room: Room;
  onUpdate: (updatedRoom: Room) => void;
  onBack: () => void;
}

const RoomDetail: React.FC<RoomDetailProps> = ({ room, onUpdate, onBack }) => {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<Task['category']>('INSPECTION');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Estados de Confirmação
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<Task | null>(null);

  const catConfigs: Record<string, { label: string, icon: string, color: string, border: string }> = {
    'CASA SEDE': { label: 'Casa Sede', icon: '🏡', color: 'from-blue-600/20 to-blue-900/10', border: 'border-blue-500/40' },
    'ÁREA GOURMET': { label: 'Área Gourmet', icon: '🥩', color: 'from-amber-600/20 to-amber-900/10', border: 'border-amber-500/40' },
    'PISCINA': { label: 'Piscina', icon: '🏊', color: 'from-cyan-600/20 to-cyan-900/10', border: 'border-cyan-500/40' },
    'INSPECTION': { label: 'Geral', icon: '🏞️', color: 'from-emerald-600/20 to-emerald-900/10', border: 'border-emerald-500/40' },
    'AI_SUGGESTION': { label: 'Sugestão AI', icon: '✨', color: 'from-purple-600/20 to-purple-900/10', border: 'border-purple-500/40' }
  };

  useEffect(() => {
    const scrollArea = document.getElementById('main-scroll-area');
    const handleScroll = () => {
      if (scrollArea) setShowScrollTop(scrollArea.scrollTop > 300);
    };
    scrollArea?.addEventListener('scroll', handleScroll);
    return () => scrollArea?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    document.getElementById('main-scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePDF = (currentRoom: Room, isEntry: boolean) => {
    const doc = new jsPDF();
    const guest = currentRoom.currentGuest;
    if (!guest) return;

    // Cores Principais
    const primaryRGB = isEntry ? [16, 185, 129] : [59, 130, 246]; // Verde ou Azul
    const orangeRGB = [245, 158, 11];
    const redRGB = [239, 68, 68];
    const greenRGB = [16, 185, 129];

    // Cabeçalho Retangular
    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SITIO RECANTO DA LIMEIRA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(isEntry ? 'RELATORIO DE VISTORIA - ENTRADA' : 'RELATORIO DE VISTORIA - SAIDA', 105, 30, { align: 'center' });

    // Informações Gerais
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text(`Hospede: ${guest.name}`, 15, 50);
    doc.text(`CPF: ${guest.documentId}`, 15, 56);
    doc.text(`Unidade: ${currentRoom.number}`, 15, 62);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 130, 50);
    doc.text(`Hora: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 130, 56);

    // Fotos do Check-in
    try {
      if (guest.documentPhotoUri) {
        doc.text('Foto Documento:', 15, 75);
        doc.addImage(guest.documentPhotoUri, 'JPEG', 15, 80, 40, 40);
      }
      if (guest.facePhotoUri) {
        doc.text('Biometria Facial:', 65, 75);
        doc.addImage(guest.facePhotoUri, 'JPEG', 65, 80, 40, 40);
      }
    } catch (e) { console.error('Erro na imagem do PDF', e); }

    // Título da Auditoria
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('CONSOLIDADO DE PATRIMONIO POR AREA:', 15, 135);
    doc.line(15, 137, 195, 137);

    // Agrupar Tarefas por Categoria
    const grouped = currentRoom.tasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    let y = 145;
    const categories = Object.keys(grouped).sort();

    categories.forEach(catKey => {
      if (y > 260) { doc.addPage(); y = 20; }
      
      const config = catConfigs[catKey];
      const categoryLabel = config ? config.label : catKey;

      // Renderiza Título da Categoria
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryRGB[0], primaryRGB[1], primaryRGB[2]);
      doc.text(categoryLabel.toUpperCase(), 15, y);
      y += 6;

      // Renderiza Itens da Categoria
      doc.setFontSize(8);
      grouped[catKey].forEach(task => {
        if (y > 275) { doc.addPage(); y = 20; }
        
        let statusText = '';
        let statusColor = [100, 100, 100];

        if (task.status === 'OK') {
          statusText = '[ OK ]';
          statusColor = greenRGB;
        } else if (task.status === 'NAO_OK') {
          statusText = '[ AVARIA ]';
          statusColor = orangeRGB;
        } else {
          statusText = '[ PENDENTE ]';
          statusColor = redRGB;
        }

        // Status Colorido
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(statusText, 20, y);

        // Nome do Item (Cinza escuro)
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const offset = doc.getTextWidth(statusText) + 2;
        doc.text(`- ${task.title}`, 20 + offset, y);
        
        y += 5;
      });
      y += 4; // Espaço entre categorias
    });

    // Rodapé de Boas-vindas / Saída
    const footerY = 285;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const footerMsg = isEntry 
      ? "Seja bem-vindo ao Sitio Recanto da Limeira! Desejamos uma excelente estadia."
      : "Agradecemos a preferencia! Esperamos que tenha desfrutado de momentos felizes.";
    
    doc.text(footerMsg, 105, footerY - 8, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Gerado por InnCheck Intelligent - Gestao de Propriedades', 105, footerY, { align: 'center' });

    doc.save(`vistoria_${isEntry ? 'entrada' : 'saida'}_${currentRoom.number.replace(/\s+/g, '_')}.pdf`);
  };

  const availableCategories = useMemo(() => {
    return Array.from(new Set(room.tasks.map(t => t.category))).sort();
  }, [room.tasks]);

  const toggleTask = (taskId: string) => {
    const updatedTasks = room.tasks.map(t => {
      if (t.id === taskId) {
        const nextStatus: TaskStatus = t.status === 'OK' ? 'NAO_OK' : t.status === 'NAO_OK' ? 'PENDENTE' : 'OK';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    onUpdate({ ...room, tasks: updatedTasks });
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = room.tasks.filter(t => t.id !== taskId);
    onUpdate({ ...room, tasks: updatedTasks });
  };

  const deleteCategory = (category: string) => {
    const updatedTasks = room.tasks.filter(t => t.category !== category);
    onUpdate({ ...room, tasks: updatedTasks });
    setConfirmDeleteCat(null);
  };

  const handleAddNewItem = () => {
    if (!newItemTitle.trim()) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newItemTitle,
      status: 'PENDENTE',
      category: newItemCategory
    };
    onUpdate({ ...room, tasks: [...room.tasks, newTask] });
    setNewItemTitle('');
    setIsAddingItem(false);
  };

  const progress = room.tasks.length > 0 ? Math.round((room.tasks.filter(t => t.status === 'OK').length / room.tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-48 px-2 animate-in fade-in duration-500 relative">
      
      {/* HEADER NAVEGAÇÃO */}
      <div className="flex items-center justify-between py-4 px-2">
         <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-active:scale-90 transition-all border border-white/10">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Painel Geral</span>
         </button>
         
         <div className="text-right flex flex-col items-end">
            <h1 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-2">
               <span className="text-emerald-500">🏡</span> {room.number}
            </h1>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{room.type}</p>
         </div>
      </div>

      {/* CARD DO HÓSPEDE */}
      {room.currentGuest && (
        <GlassContainer className="p-8 border-emerald-500/20 shadow-xl overflow-hidden relative animate-in slide-in-from-top-4">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex -space-x-8">
              <img src={room.currentGuest.facePhotoUri} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#0f172a] object-cover shadow-2xl ring-4 ring-emerald-500/30" />
              <img src={room.currentGuest.documentPhotoUri} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-[#0f172a] object-cover shadow-2xl ring-4 ring-blue-500/30" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Hóspede Ativo</p>
              <h2 className="text-3xl font-black text-white tracking-tight">{room.currentGuest.name}</h2>
              <div className="flex gap-4 justify-center md:justify-start">
                 <p className="text-xs text-slate-400 font-bold">CPF: {room.currentGuest.documentId}</p>
                 <p className="text-xs text-emerald-500 font-bold uppercase">Check-in: {room.currentGuest.checkInTime}</p>
              </div>
            </div>
          </div>
        </GlassContainer>
      )}

      {/* RELATÓRIO DO CHECKLIST */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-4">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Checklist Patrimonial</h3>
           <button onClick={() => setIsAddingItem(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg">+ Novo Item</button>
        </div>

        {availableCategories.map(catId => {
          const catTasks = room.tasks.filter(t => t.category === catId);
          const config = catConfigs[catId] || { label: catId, icon: '📦', color: 'from-slate-600/20 to-slate-900/10', border: 'border-slate-500/40' };
          return (
            <div key={catId} className={`p-6 rounded-[32px] border ${config.border} bg-gradient-to-br ${config.color} shadow-sm group`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl">{config.icon}</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/70">{config.label}</h3>
                <div className="h-[1px] flex-1 bg-white/10 mx-4"></div>
                <button 
                  onClick={() => setConfirmDeleteCat(catId)}
                  className="p-2 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {catTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] duration-200 cursor-pointer ${
                      task.status === 'OK' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 
                      task.status === 'NAO_OK' ? 'bg-rose-500/10 border-rose-500/40 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]' : 
                      'bg-black/20 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div 
                      onClick={() => toggleTask(task.id)}
                      className={`mt-0.5 w-8 h-8 rounded-xl border flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        task.status === 'OK' ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110' : 
                        task.status === 'NAO_OK' ? 'bg-rose-500 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] scale-110' : 
                        'border-white/20 group-hover:border-white/40'
                      }`}
                    >
                      {task.status === 'OK' && <svg className="w-4 h-4 text-white animate-in zoom-in-50 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      {task.status === 'NAO_OK' && <span className="text-white text-xs font-black animate-in zoom-in-50 duration-300">!</span>}
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => toggleTask(task.id)}>
                      <p className={`text-sm font-bold leading-tight transition-colors duration-300 ${task.status === 'OK' ? 'text-emerald-300' : task.status === 'NAO_OK' ? 'text-rose-300' : 'text-slate-300'}`}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setEditingTaskId(task.id); setEditTitle(task.title); }} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><IconEdit className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteItem(task); }} className="p-2.5 bg-rose-500/5 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><IconTrash className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLUTUANTE DE AÇÃO */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none z-50">
         <div className="max-w-md w-full bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-[32px] flex items-center gap-4 pointer-events-auto shadow-2xl">
            <div className="relative w-12 h-12 flex-shrink-0">
               <svg className="w-full h-full transform -rotate-90">
                 <circle className="text-white/5" strokeWidth="4" stroke="currentColor" fill="transparent" r="22" cx="24" cy="24" />
                 <circle className="text-emerald-500 transition-all duration-1000" strokeWidth="4" strokeDasharray={138} strokeDashoffset={138 - (138 * progress) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="22" cx="24" cy="24" />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">{progress}%</span>
            </div>
            <button 
              onClick={() => room.status === RoomStatus.AVAILABLE ? setShowCheckIn(true) : setShowCheckOut(true)} 
              className={`flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all ${room.status === RoomStatus.AVAILABLE ? 'bg-emerald-600' : 'bg-rose-600'}`}
            >
              {room.status === RoomStatus.AVAILABLE ? 'Iniciar Estadia' : 'Finalizar Estadia'}
            </button>
         </div>
      </div>

      {/* BOTÃO SUBIR */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-28 right-8 w-12 h-12 glass rounded-full flex items-center justify-center text-emerald-400 border-emerald-500/20 shadow-2xl transition-all duration-300 z-[100] ${showScrollTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {/* MODAL ADICIONAR / EDITAR */}
      {(isAddingItem || editingTaskId) && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f172a] rounded-[24px] border border-white/10 p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{editingTaskId ? 'Editar Ativo' : 'Novo Ativo'}</h4>
            <div className="space-y-4">
              <textarea 
                autoFocus
                value={editingTaskId ? editTitle : newItemTitle} 
                onChange={e => editingTaskId ? setEditTitle(e.target.value) : setNewItemTitle(e.target.value)}
                placeholder="Descrição do item..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-emerald-500 h-28 resize-none"
              />
              {!editingTaskId && (
                <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value as any)} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm outline-none">
                  {Object.keys(catConfigs).map(key => <option key={key} value={key} className="bg-[#0f172a]">{catConfigs[key].label}</option>)}
                </select>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setIsAddingItem(false); setEditingTaskId(null); }} className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400">Cancelar</button>
              <button onClick={() => editingTaskId ? (onUpdate({...room, tasks: room.tasks.map(t => t.id === editingTaskId ? {...t, title: editTitle} : t)}), setEditingTaskId(null)) : handleAddNewItem()} className="flex-1 py-3 bg-emerald-600 rounded-xl text-[10px] font-black uppercase text-white shadow-lg active:scale-95 transition-all">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO DE ITEM INDIVIDUAL */}
      {confirmDeleteItem && (
        <div className="fixed inset-0 z-[210] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="w-full max-w-xs bg-[#0f172a] rounded-[24px] border border-rose-500/30 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
               <IconTrash className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-white uppercase tracking-tight">Excluir este item?</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate px-2">"{confirmDeleteItem.title}"</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setConfirmDeleteItem(null)} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-500">Voltar</button>
              <button onClick={() => { deleteTask(confirmDeleteItem.id); setConfirmDeleteItem(null); }} className="flex-1 py-3 bg-rose-600 rounded-xl text-[10px] font-black uppercase text-white shadow-xl shadow-rose-600/20 active:scale-95 transition-all">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO DE CATEGORIA COMPLETA */}
      {confirmDeleteCat && (
        <div className="fixed inset-0 z-[210] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="w-full max-w-xs bg-[#0f172a] rounded-[24px] border border-rose-500/30 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
               <IconTrash className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-white uppercase tracking-tight">Excluir categoria?</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">"{catConfigs[confirmDeleteCat]?.label || confirmDeleteCat}" e todos seus ativos.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setConfirmDeleteCat(null)} className="flex-1 py-3 text-[10px] font-black uppercase text-slate-500">Voltar</button>
              <button onClick={() => deleteCategory(confirmDeleteCat)} className="flex-1 py-3 bg-rose-600 rounded-xl text-[10px] font-black uppercase text-white shadow-xl shadow-rose-600/20 active:scale-95 transition-all">Excluir Tudo</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOWS */}
      {showCheckIn && <CheckInFlow roomType={room.type} onComplete={(g) => { 
        const updatedRoom = {...room, status: RoomStatus.OCCUPIED, currentGuest: g};
        onUpdate(updatedRoom); 
        generatePDF(updatedRoom, true); 
        setShowCheckIn(false); 
      }} onCancel={() => setShowCheckIn(false)} />}
      
      {showCheckOut && <CheckOutFlow guestName={room.currentGuest?.name || ''} onComplete={() => { 
        generatePDF(room, false); 
        const resetTasks = room.tasks.map(t => ({ ...t, status: 'PENDENTE' as TaskStatus }));
        onUpdate({...room, status: RoomStatus.AVAILABLE, currentGuest: undefined, tasks: resetTasks}); 
        setShowCheckOut(false); 
      }} onCancel={() => setShowCheckOut(false)} />}
    </div>
  );
};

export default RoomDetail;
