
import React, { useState, useEffect, useCallback } from 'react';
import { Room, RoomStatus, UserRole, ChecklistTemplate } from '../types';
import { INITIAL_ROOMS, INITIAL_TEMPLATES } from '../constants';
import Dashboard from './components/Dashboard';
import RoomList from './components/RoomList';
import RoomDetail from './components/RoomDetail';
import Login from './components/Login';
import Splash from './components/Splash';
import AdminPanel from './components/AdminPanel';
import { IconDashboard, IconRoom, IconSettings, IconSparkles } from './components/Icons';
import { ttsService } from './services/ttsService';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<{name: string, role: UserRole} | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'settings'>('dashboard');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(INITIAL_TEMPLATES);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedRooms = localStorage.getItem('inncheck_rooms');
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    const savedTemplates = localStorage.getItem('inncheck_templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    const savedUser = localStorage.getItem('inncheck_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (role: UserRole, name: string) => {
    const newUser = { role, name };
    setUser(newUser);
    localStorage.setItem('inncheck_user', JSON.stringify(newUser));
    ttsService.speak(`Bem-vindo ao painel administrativo.`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('inncheck_user');
    setSelectedRoom(null);
  };

  const updateRooms = useCallback((nextRooms: Room[]) => {
    setRooms(nextRooms);
    localStorage.setItem('inncheck_rooms', JSON.stringify(nextRooms));
  }, []);

  const updateSingleRoom = useCallback((updatedRoom: Room) => {
    setRooms(prev => {
      const next = prev.map(r => r.id === updatedRoom.id ? updatedRoom : r);
      localStorage.setItem('inncheck_rooms', JSON.stringify(next));
      return next;
    });
    setSelectedRoom(updatedRoom);
  }, []);

  const updateTemplates = useCallback((nextTemplates: ChecklistTemplate[]) => {
    setTemplates(nextTemplates);
    localStorage.setItem('inncheck_templates', JSON.stringify(nextTemplates));
  }, []);

  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-lexend">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass-dark border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30"><IconSparkles className="w-6 h-6 text-white" /></div>
            <h1 className="text-2xl font-black tracking-tight text-white">InnCheck.</h1>
          </div>
          <nav className="space-y-2 flex-1">
            <SidebarNavItem label="Dashboard" icon={IconDashboard} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedRoom(null); setSidebarOpen(false); }} />
            <SidebarNavItem label="Propriedades" icon={IconRoom} active={activeTab === 'rooms'} onClick={() => { setActiveTab('rooms'); setSelectedRoom(null); setSidebarOpen(false); }} />
            <SidebarNavItem label="Gestão" icon={IconSettings} active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSelectedRoom(null); setSidebarOpen(false); }} />
          </nav>
          <button onClick={handleLogout} className="mt-auto py-3 border border-white/5 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-rose-500/10 transition-all">Sair do Painel</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 glass border-b border-white/5 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-xl lg:hidden"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg></button>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              {selectedRoom ? (
                <>🏡 Vistoria: {selectedRoom.number}</>
              ) : activeTab === 'settings' ? (
                <>🏡 Gerenciamento Sítio Limeira</>
              ) : (
                <>🏡 {activeTab.toUpperCase()}</>
              )}
            </h2>
          </div>
          <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sítio Recanto da Limeira 🏡</span>
          </div>
        </header>

        <div id="main-scroll-area" className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scroll relative">
          {selectedRoom ? (
            <RoomDetail room={selectedRoom} onUpdate={updateSingleRoom} onBack={() => setSelectedRoom(null)} />
          ) : (
            <>
              {activeTab === 'dashboard' && <Dashboard rooms={rooms} />}
              {activeTab === 'rooms' && <RoomList rooms={rooms} onSelect={setSelectedRoom} />}
              {activeTab === 'settings' && <AdminPanel rooms={rooms} templates={templates} onUpdateRooms={updateRooms} onUpdateTemplates={updateTemplates} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const SidebarNavItem = ({ label, icon: Icon, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    <Icon className="w-5 h-5" />
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export default App;
