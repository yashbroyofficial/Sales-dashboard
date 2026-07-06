import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  DollarSign, 
  Plus, 
  Calendar, 
  FileText, 
  Download,
  Clock,
  ArrowUpRight,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { CRMStats, Client, Reminder } from '../types.js';

interface StatsDashboardProps {
  stats: CRMStats;
  recentClients: Client[];
  upcomingReminders: Reminder[];
  onAddClient: () => void;
  onScheduleCall: () => void;
  onAddNote: () => void;
  onExportAll: () => void;
  onSelectClient: (clientId: string) => void;
  theme: 'dark' | 'light';
}

export default function StatsDashboard({
  stats,
  recentClients,
  upcomingReminders,
  onAddClient,
  onScheduleCall,
  onAddNote,
  onExportAll,
  onSelectClient,
  theme
}: StatsDashboardProps) {
  
  const cardItems = [
    {
      title: 'Total Lead Pipeline',
      value: stats.totalClients,
      sub: 'All registered clients',
      icon: Users,
      color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    },
    {
      title: 'Conversions',
      value: stats.convertedClients,
      sub: 'Deal finalized successfully',
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Work In Progress',
      value: stats.workInProgress,
      sub: 'Active service execution',
      icon: Clock,
      color: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    },
    {
      title: 'Failed Prospects',
      value: stats.failedClients,
      sub: 'Prospects closed failed',
      icon: AlertCircle,
      color: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    },
    {
      title: 'Follow Ups Pending',
      value: stats.followUpsPending,
      sub: 'Reminders outstanding',
      icon: Calendar,
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    },
    {
      title: 'Calls Logged Today',
      value: stats.callsMadeToday,
      sub: 'Real-time sales touches',
      icon: PhoneCall,
      color: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    },
    {
      title: 'Revenue Generated',
      value: `$${(stats.revenueGenerated || 0).toLocaleString()}`,
      sub: 'Closed won revenue ledger',
      icon: DollarSign,
      color: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    },
    {
      title: 'Conversion Ratio',
      value: `${stats.conversionRate}%`,
      sub: 'Pro ratio lead conversions',
      icon: TrendingUp,
      color: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Header Display */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white font-sans flex items-center gap-2">
            Performance Dashboard <Sparkles className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Real-time corporate metrics summary indices, converted pipelines, and active agendas.
          </p>
        </div>

        {/* Quick Action Controls rail */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddClient}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/15 active:translate-y-px transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Client
          </button>
          <button
            onClick={onScheduleCall}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold active:translate-y-px transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-slate-400" /> Schedule Call
          </button>
          <button
            onClick={onAddNote}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold active:translate-y-px transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-400" /> Add Notes
          </button>
          <button
            onClick={onExportAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-350 border border-slate-750 text-xs font-bold active:translate-y-px transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" /> Export CRM
          </button>
        </div>
      </div>

      {/* KPI Stats Grid with Bold Design Markup */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cardItems.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div 
              key={idx}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-md relative overflow-hidden group hover:border-slate-650 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5 font-sans tracking-tight">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-2 rounded-lg border ${card.color} flex items-center justify-center shrink-0`}>
                  <IconComp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-700/60 pt-3 mt-1">
                <span className="truncate text-[10px] font-semibold">{card.sub}</span>
                <span className="text-emerald-500 font-bold flex items-center shrink-0">
                  Live <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-1 inline-block animate-pulse" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Widget panels (Recent conversions vs. Outstanding follow-ups) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Clients Workspace Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Clients
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">Newly active business opportunities registered.</p>
            </div>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-bold px-2.5 py-1 rounded-lg">
              Sales Pipeline
            </span>
          </div>

          <div className="flex-1 divide-y divide-slate-800/50 mt-2">
            {recentClients.length > 0 ? (
              recentClients.slice(0, 5).map((client) => (
                <div 
                  key={client.id}
                  onClick={() => onSelectClient(client.id)}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-850/30 rounded-xl px-2 transition-all cursor-pointer group"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-semibold text-white truncate max-w-[170px]">
                      {client.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[170px]">
                      {client.companyName} • {client.industry}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      client.status === 'Converted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      client.status === 'Failed' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      client.status === 'Work In Progress' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' :
                      'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      {client.status}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500">
                <Users className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs">No clients loaded yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Outstanding Follow-up Reminders Workspace Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Impending Follow-ups
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">Calendar call reminders scheduled for this week.</p>
            </div>
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 font-bold px-2.5 py-1 rounded-lg">
              Urgent Touch
            </span>
          </div>

          <div className="flex-1 mt-2 space-y-2">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.slice(0, 5).map((rem, i) => {
                const accentColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-fuchsia-500'];
                const accentClass = accentColors[i % accentColors.length];
                return (
                  <div 
                    key={rem.id} 
                    onClick={() => onSelectClient(rem.clientId)}
                    className="flex items-center justify-between py-3 px-3 hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      {/* Left vertical color indicator */}
                      <div className={`w-1 h-8 ${accentClass} rounded-full shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate max-w-[170px]">
                          {rem.clientName}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {rem.notes}
                        </p>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap shrink-0">
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-950 border border-slate-800 px-2 py-1 rounded flex items-center justify-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {rem.time}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600/30 mb-2" />
                <span className="text-xs font-semibold text-slate-400">All follow-ups complete!</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
