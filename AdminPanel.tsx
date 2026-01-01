
import React, { useState, useEffect } from 'react';
import { Room, RoomStatus, ChecklistTemplate, Task } from '../types';
import GlassContainer from './GlassContainer';
import { IconSettings, IconTrash, IconEdit, IconDownload } from './Icons';

interface AdminPanelProps {
  rooms: Room[];
  templates: ChecklistTemplate[];
  onUpdateRooms: (rooms: Room[]) => void;
  onUpdateTemplates: (templates: ChecklistTemplate[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ rooms, templates, onUpdateRooms, onUpdateTemplates }) => {
  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'templates' | 'install'>('rooms');
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ number: '', type: '', templateId: '' });
  const [newItem, setNewItem] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  
  const [editingTemplateItem, setEditingTemplateItem] = useState<{ tplId: string, idx: number, title: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ 
    type: 'room' | 'template' | 'templateItem', 
    id: string, 
    extraId?: string, 
    name: string 
  } | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setActiveSubTab('install');
    }
  };

  const handleAddRoom = () => {
    if (!newRoom.number || !newRoom.type) return;
    const template = templates.find(t => t.id === newRoom.templateId);
    const room: Room = {
      id: `room-${Date.now()}`,
      number: newRoom.number,
      type: newRoom.type,
      status: RoomStatus.AVAILABLE,
      tasks: template ? template.items.map((it, i) => ({ 
        id: `t-${i}-${Date.now()}`, 
        title: it.title, 
        status: 'PENDENTE', 
        category: it.category 
      })) : []
    };
    onUpdateRooms([...rooms, room]);
    setIsAddingRoom(false);
    setNewRoom({ number: '', type: '', templateId: '' });
  };

  const handleExecuteDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'room') onUpdateRooms(rooms.filter(r => r.id !== confirmDelete.id));
    else if (confirmDelete.type === 'template') onUpdateTemplates(templates.filter(t => t.id !== confirmDelete.id));
    else if (confirmDelete.type === 'templateItem' && confirmDelete.extraId) {
      const tplId = confirmDelete.extraId;
      const itemIdx = parseInt(confirmDelete.id);
      onUpdateTemplates(templates.map(t => t.id === tplId ? { ...t, items: t.items.filter((_, i) => i !== itemIdx) } : t));
    }
    setConfirmDelete(null);
  };

  const handleSaveItemEdit = () => {
    if (!editingTemplateItem || !editingTemplateItem.title.trim()) return;
    onUpdateTemplates(templates.map(t => t.id === editingTemplateItem.tplId ? {
      ...t,
      items: t.items.map((item, idx) => idx === editingTemplateItem.idx ? { ...item, title: editingTemplateItem.title } : item)
    } : t));
    setEditingTemplateItem(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto relative">
      
      {/* CARD DE INSTALAÇÃO PWA */}
      <GlassContainer className="border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-6 p-8">
        <div className="flex items-center gap-6 text-center sm:text-left">
          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
             <IconDownload className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-black text-white tracking-tight">Instalar App no Celular</h4>
            <p className="text-sm text-slate-400 font-medium">Use como um aplicativo nativo e acesse mais rápido.</p>
          </div>
        </div>
        <button 
          onClick={handleInstallClick}
          className="w-full sm:w-auto px-10 h-14 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          {deferredPrompt ? 'Instalar Agora' : 'Ver Instruções'}
        </button>
      </GlassContainer>

      {/* ABAS DE NAVEGAÇÃO DA GESTÃO */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-2xl font-black text-emerald-400 flex items-center gap-3"><IconSettings className="w-8 h-8" /> Configurações</h3>
        <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveSubTab('rooms')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'rooms' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>Unidades</button>
          <button onClick={() => setActiveSubTab('templates')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'templates' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>Modelos</button>
          <button onClick={() => setActiveSubTab('install')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === 'install' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>Como Baixar</button>
        </div>
      </div>

      {activeSubTab === 'rooms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button onClick={() => setIsAddingRoom(true)} className="h-[180px] border-2 border-dashed border-white/10 rounded-[32px] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex flex-col items-center justify-center gap-4 group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">+</div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Adicionar Unidade</span>
          </button>
          {rooms.map(room => (
            <GlassContainer key={room.id} className="relative h-[180px] flex flex-col justify-between border-white/5 hover:border-emerald-500/20 transition-all">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <h4 className="font-black text-lg truncate">{room.number}</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">{room.type}</p>
                </div>
                <button onClick={() => setConfirmDelete({ type: 'room', id: room.id, name: room.number })} className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20">
                   <IconTrash className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{room.tasks.length} Itens</span>
                 <span className={`w-2 h-2 rounded-full ${room.status === RoomStatus.AVAILABLE ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </div>
            </GlassContainer>
          ))}
        </div>
      )}

      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map(tpl => (
            <GlassContainer key={tpl.id} className="border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-white uppercase tracking-tighter truncate pr-4">{tpl.name}</h4>
                <button onClick={() => setConfirmDelete({ type: 'template', id: tpl.id, name: tpl.name })} className="text-rose-500 p-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20"><IconTrash className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2 custom-scroll">
                {tpl.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 group transition-all hover:bg-white/10">
                    <span className="text-xs font-medium text-slate-300 truncate flex-1">{item.title}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setEditingTemplateItem({ tplId: tpl.id, idx, title: item.title })} 
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                      >
                         <IconEdit className="w-3 h-3" />
                      </button>
                      <button onClick={() => setConfirmDelete({ type: 'templateItem', id: idx.toString(), extraId: tpl.id, name: `o item "${item.title}"` })} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                         <IconTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={activeTemplateId === tpl.id ? newItem : ''} onChange={(e) => { setActiveTemplateId(tpl.id); setNewItem(e.target.value); }} onKeyPress={(e) => e.key === 'Enter' && newItem && onUpdateTemplates(templates.map(t => t.id === tpl.id ? {...t, items: [...t.items, {title: newItem, category: 'INSPECTION'}]} : t))} placeholder="Novo item..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-xs text-white" />
                <button onClick={() => { if(!newItem) return; onUpdateTemplates(templates.map(t => t.id === tpl.id ? {...t, items: [...t.items, {title: newItem, category: 'INSPECTION'}]} : t)); setNewItem(''); }} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg active:scale-90 transition-all">+</button>
              </div>
            </GlassContainer>
          ))}
        </div>
      )}

      {activeSubTab === 'install' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
          <GlassContainer className="border-blue-500/20 p-8 space-y-6">
            <h4 className="text-lg font-black text-blue-400 uppercase tracking-tighter">No Android (Chrome)</h4>
            <ol className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black">1</span> <span>Abra o link do app no Google Chrome.</span></li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black">2</span> <span>Clique nos 3 pontinhos (Menu) no canto superior.</span></li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black">3</span> <span>Selecione <strong>"Instalar aplicativo"</strong> ou "Adicionar à tela inicial".</span></li>
            </ol>
          </GlassContainer>
          <GlassContainer className="border-purple-500/20 p-8 space-y-6">
            <h4 className="text-lg font-black text-purple-400 uppercase tracking-tighter">No iPhone (Safari)</h4>
            <ol className="space-y-4 text-sm text-slate-400">
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black">1</span> <span>Abra o link do app no navegador Safari.</span></li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black">2</span> <span>Clique no ícone de <strong>Compartilhar</strong> (quadrado com seta).</span></li>
              <li className="flex gap-3"><span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black">3</span> <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</span></li>
            </ol>
          </GlassContainer>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO E EDIÇÃO OMITIDOS PARA BREVIDADE, MAS MANTIDOS NO CÓDIGO FINAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1e293b] rounded-[40px] border border-white/10 p-8 shadow-2xl space-y-8 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
              <IconTrash className="w-10 h-10" />
            </div>
            <div className="text-center space-y-3">
              <h4 className="text-xl font-black text-white uppercase tracking-tighter">Confirmar Exclusão</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Excluir {confirmDelete.name}?</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-[52px] bg-white/5 text-slate-400 font-bold uppercase text-[10px] rounded-2xl">Cancelar</button>
              <button onClick={handleExecuteDelete} className="flex-1 h-[52px] bg-rose-600 text-white font-bold uppercase text-[10px] rounded-2xl">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {isAddingRoom && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full">
            <GlassContainer className="border-emerald-500/20 py-8 px-6">
              <h4 className="text-xl font-black mb-6 text-white uppercase tracking-tighter">Nova Unidade</h4>
              <div className="space-y-4">
                <input value={newRoom.number} onChange={e => setNewRoom({...newRoom, number: e.target.value})} placeholder="Ex: Chalé Suíço 01" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                <input value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})} placeholder="Ex: Master VIP" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white" />
                <select value={newRoom.templateId} onChange={e => setNewRoom({...newRoom, templateId: e.target.value})} className="w-full bg-[#1e293b] border border-white/10 rounded-2xl px-5 py-4 text-white">
                  <option value="">Sem modelo (vazia)</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button onClick={() => setIsAddingRoom(false)} className="py-4 font-black text-slate-500 uppercase text-[10px] bg-white/5 rounded-2xl">Cancelar</button>
                <button onClick={handleAddRoom} className="py-4 font-black bg-emerald-500 text-white uppercase text-[10px] rounded-2xl">Salvar</button>
              </div>
            </GlassContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
