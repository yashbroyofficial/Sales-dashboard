import React from 'react';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  Calendar, 
  Activity, 
  LogOut, 
  User, 
  Bell, 
  Menu,
  Moon,
  Sun,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { User as UserType } from '../types.js';

interface MainSidebarProps {
  user: UserType;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  unreadNotificationsCount: number;
  setShowNotifications: (show: boolean) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function MainSidebar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  unreadNotificationsCount,
  setShowNotifications,
  theme,
  setTheme
}: MainSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'clients', label: 'Clients Lead Manager', icon: Users },
    { id: 'projects', label: 'Active Projects', icon: Briefcase },
    { id: 'calendar', label: 'CRM Calendar', icon: Calendar },
    { id: 'activities', label: 'System Action Logs', icon: Activity }
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-8 pb-4 flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold text-white tracking-tighter uppercase leading-none font-sans">
          SalesCore<span className="text-indigo-550">.</span>
        </h1>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          CRM EXECUTIVE SUITE
        </span>
      </div>

      {/* Navigation Modules list */}
      <div className="flex-1 px-4 py-6 space-y-1">
        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">
          Core Workspaces
        </span>

        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white font-bold tracking-tight'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Action center / Notification center triggers */}
      <div className="px-4 py-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => setShowNotifications(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/20 transition-all cursor-pointer relative"
        >
          <span className="flex items-center gap-3.5">
            <Bell className="w-5 h-5 text-slate-500" />
            Notification Portal
          </span>
          {unreadNotificationsCount > 0 && (
            <span className="h-5 w-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold absolute right-3 animate-bounce">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {/* Logined User info panel */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/25 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="truncate max-w-[120px]">
            <p className="text-xs font-bold text-white leading-normal truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 leading-none truncate mt-0.5 uppercase tracking-wide">
              {user.role} Account
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          title="Sign out of system"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
