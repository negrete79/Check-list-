
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import GlassContainer from './GlassContainer';
import { Room, RoomStatus } from '../types';

interface DashboardProps {
  rooms: Room[];
}

const Dashboard: React.FC<DashboardProps> = ({ rooms }) => {
  const data = [
    { name: 'Seg', ocupacao: 45, limpeza: 90 },
    { name: 'Ter', ocupacao: 52, limpeza: 85 },
    { name: 'Qua', ocupacao: 48, limpeza: 95 },
    { name: 'Qui', ocupacao: 61, limpeza: 88 },
    { name: 'Sex', ocupacao: 85, limpeza: 70 },
    { name: 'Sab', ocupacao: 98, limpeza: 60 },
    { name: 'Dom', ocupacao: 92, limpeza: 80 },
  ];

  const occupiedCount = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const cleaningCount = rooms.filter(r => r.status === RoomStatus.CLEANING).length;
  const availableCount = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassContainer className="border-emerald-500/20">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Taxa de Ocupação</p>
          <p className="text-4xl font-extrabold font-lexend text-emerald-400">
            {Math.round((occupiedCount / rooms.length) * 100)}%
          </p>
          <p className="text-xs text-slate-500 mt-2">↑ 12% desde ontem</p>
        </GlassContainer>

        <GlassContainer className="border-blue-500/20">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Quartos Prontos</p>
          <p className="text-4xl font-extrabold font-lexend text-blue-400">{availableCount}</p>
          <p className="text-xs text-slate-500 mt-2">Meta diária: 10</p>
        </GlassContainer>

        <GlassContainer className="border-amber-500/20">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Em Limpeza</p>
          <p className="text-4xl font-extrabold font-lexend text-amber-400">{cleaningCount}</p>
          <p className="text-xs text-slate-500 mt-2">Tempo médio: 24min</p>
        </GlassContainer>

        <GlassContainer className="border-rose-500/20">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Check-outs Hoje</p>
          <p className="text-4xl font-extrabold font-lexend text-rose-400">8</p>
          <p className="text-xs text-slate-500 mt-2">3 pendentes</p>
        </GlassContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassContainer>
          <h3 className="text-xl font-bold font-lexend mb-6">Fluxo de Ocupação Semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="ocupacao" stroke="#10b981" fillOpacity={1} fill="url(#colorOcupacao)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassContainer>

        <GlassContainer>
          <h3 className="text-xl font-bold font-lexend mb-6">Performance Operacional</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '12px' }}
                />
                <Bar dataKey="limpeza" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassContainer>
      </div>
    </div>
  );
};

export default Dashboard;
