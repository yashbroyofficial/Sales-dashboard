import React from 'react';
import { 
  X, 
  Bell, 
  Clock, 
  UserPlus, 
  CheckCircle, 
  AlertCircle,
  Briefcase
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'Reminder' | 'Deadline' | 'Contract' | 'System';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotificationCenterProps {
  show: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  show,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll
}: NotificationCenterProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Absolute backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Notification Portal</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action links */}
          <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950/30 flex justify-between items-center text-[10px] select-none">
            <button 
              onClick={onMarkAllAsRead} 
              className="font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Mark all read
            </button>
            <button 
              onClick={onClearAll} 
              className="font-bold text-slate-500 hover:text-rose-400 cursor-pointer"
            >
              Clear archive
            </button>
          </div>

          {/* Contents List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850/50">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-5 transition-colors relative flex gap-4 ${
                    notif.read ? 'bg-slate-900/40' : 'bg-slate-950/20'
                  }`}
                >
                  {/* Read Indicator Tag */}
                  {!notif.read && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md bg-indigo-500" />
                  )}

                  {/* Icon representations */}
                  <div className="scale-90">
                    <div className={`h-8.5 w-8.5 rounded-lg flex items-center justify-center ${
                      notif.type === 'Reminder' ? 'bg-rose-950/20 border border-rose-800/20 text-rose-450' :
                      notif.type === 'Deadline' ? 'bg-indigo-950/20 border border-indigo-800/20 text-indigo-450' :
                      notif.type === 'Contract' ? 'bg-emerald-950/20 border border-emerald-800/20 text-emerald-400' :
                      'bg-slate-805 border border-slate-750 text-slate-400'
                    }`}>
                      {notif.type === 'Reminder' ? <Clock className="w-4.5 h-4.5" /> :
                       notif.type === 'Deadline' ? <Briefcase className="w-4.5 h-4.5" /> :
                       notif.type === 'Contract' ? <CheckCircle className="w-4.5 h-4.5" /> :
                       <Bell className="w-4.5 h-4.5" />}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {notif.type} Service
                      </span>
                      <span className="text-[9px] text-slate-550 font-mono italic whitespace-nowrap">
                        {notif.time}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-normal mt-1 truncate">{notif.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5 max-w-prose whitespace-pre-wrap">
                      {notif.body}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-24 text-slate-600 font-sans">
                <Bell className="w-8 h-8 text-slate-700/80 mb-2 animate-pulse-slow" />
                <span className="text-xs font-semibold">Your portal center is clear!</span>
                <p className="text-[10px] text-slate-500 mt-1">Excellent job keeping reminders up-to-date.</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-center select-none">
            <p className="text-[10px] text-slate-500 tracking-wide font-sans">
              Critical follow-ups trigger alerts automatically 10 min prior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
