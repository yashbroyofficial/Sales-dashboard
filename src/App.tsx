import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  X, 
  Clock, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Search, 
  Users, 
  Sparkles, 
  Layers,
  PhoneCall,
  Mail,
  User,
  Activity,
  History,
  CheckCircle2,
  Trash2
} from 'lucide-react';

// Custom components
import LoginScreen from './components/LoginScreen.js';
import MainSidebar from './components/MainSidebar.js';
import StatsDashboard from './components/StatsDashboard.js';
import ClientsTable from './components/ClientsTable.js';
import ClientDetailView from './components/ClientDetailView.js';
import AnalyticsCharts from './components/AnalyticsCharts.js';
import CalendarView from './components/CalendarView.js';
import NotificationCenter from './components/NotificationCenter.js';
import ImportExportEngine from './components/ImportExportEngine.js';

// Types
import { 
  User as UserType, 
  Client, 
  CRMStats, 
  Reminder, 
  ActivityLog, 
  ClientStatus, 
  ClientPriority, 
  LeadSource 
} from './types.js';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('crm_token'));
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Core records lists
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<CRMStats>({
    totalClients: 0,
    convertedClients: 0,
    workInProgress: 0,
    failedClients: 0,
    followUpsPending: 0,
    callsMadeToday: 0,
    revenueGenerated: 0,
    conversionRate: 0
  });
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Selected client folder
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Modals state triggers
  const [showImport, setShowImport] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showScheduleCall, setShowScheduleCall] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  // New Client Form states
  const [newCName, setNewCName] = useState('');
  const [newCCompany, setNewCCompany] = useState('');
  const [newCEmail, setNewCEmail] = useState('');
  const [newCPhone, setNewCPhone] = useState('');
  const [newCWhatsApp, setNewCWhatsApp] = useState('');
  const [newCCity, setNewCCity] = useState('New York');
  const [newCCountry, setNewCCountry] = useState('United States');
  const [newCWebsite, setNewCWebsite] = useState('');
  const [newCIndustry, setNewCIndustry] = useState('Technology');
  const [newCStatus, setNewCStatus] = useState<ClientStatus>('New Lead');
  const [newCPriority, setNewCPriority] = useState<ClientPriority>('Medium');
  const [newCSource, setNewCSource] = useState<LeadSource>('Website');
  const [newCServices, setNewCServices] = useState('');
  const [newCBudget, setNewCBudget] = useState(15000);
  const [newCExpRev, setNewCExpRev] = useState(15000);
  const [newCStartDate, setNewCStartDate] = useState('');
  const [newCDeadline, setNewCDeadline] = useState('');
  const [newCAssignedTo, setNewCAssignedTo] = useState('John Doe');

  // Schedule Call Form state
  const [schedClientId, setSchedClientId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedNotes, setSchedNotes] = useState('');

  // Add notes state
  const [noteClientId, setNoteClientId] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');

  // Fetch logged user on boot
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Stale auth session.');
      })
      .then(data => {
        setCurrentUser(data.user);
      })
      .catch(() => {
        handleLogout();
      });
    }
  }, [token]);

  // Fetch full lists of clients and dashboard KPIs
  const loadCRMData = () => {
    if (!token) return;

    // Load clients
    fetch('/api/clients')
    .then(res => res.json())
    .then(data => {
      setClients(data);
      setRecentClients(data.slice(0, 8));
    })
    .catch(err => console.error('Error fetching clients:', err));

    // Load stats
    fetch('/api/dashboard/stats')
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(err => console.error('Error loading stats:', err));

    // Load calendar events for highlights
    fetch('/api/calendar/events')
    .then(res => res.json())
    .then(data => {
      // Filter incomplete followups
      const uncompleteFUs = data
        .filter((e: any) => e.type === 'Follow Up' && !e.completed)
        .map((e: any) => ({
          id: e.id,
          clientId: e.id.replace('ev-rem-', ''),
          clientName: e.clientName,
          date: e.date,
          time: e.time,
          notes: e.description,
          completed: false
        }));
      setUpcomingReminders(uncompleteFUs);
    })
    .catch(err => console.error(err));

    // Load Activities
    fetch('/api/activities')
    .then(res => res.json())
    .then(data => setActivityLogs(data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    if (token) {
      loadCRMData();
    }
  }, [token, activeTab]);

  const handleLoginSuccess = (user: UserType, userToken: string) => {
    localStorage.setItem('crm_token', userToken);
    setToken(userToken);
    setCurrentUser(user);
    loadCRMData();
  };

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    setToken(null);
    setCurrentUser(null);
    setSelectedClientId(null);
  };

  // Create Client
  const handleCreateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCName || !newCCompany || !newCEmail) {
      alert('Please fill out Name, Company, and Email fields.');
      return;
    }

    try {
      const payload = {
        name: newCName,
        companyName: newCCompany,
        email: newCEmail,
        phone: newCPhone,
        whatsApp: newCWhatsApp,
        address: '',
        city: newCCity,
        state: '',
        country: newCCountry,
        industry: newCIndustry,
        website: newCWebsite,
        businessType: 'B2B',
        companySize: '10-50',
        serviceRequired: newCServices,
        currentProject: '',
        projectDescription: '',
        budget: Number(newCBudget),
        expectedRevenue: Number(newCExpRev),
        startDate: newCStartDate,
        deadline: newCDeadline,
        status: newCStatus,
        priority: newCPriority,
        leadSource: newCSource,
        assignedTo: newCAssignedTo
      };

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-current-user': currentUser?.name || 'Administrator'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddClient(false);
        // Clear forms
        setNewCName('');
        setNewCCompany('');
        setNewCEmail('');
        setNewCPhone('');
        setNewCWhatsApp('');
        // Reload
        loadCRMData();
        
        // Add notification
        const bonusNotif = {
          id: String(Date.now()),
          type: 'System',
          title: 'Lead Registered',
          body: `Added corporate lead "${newCName} (${newCCompany})" to Salesforce database files.`,
          time: 'Just now',
          read: false
        };
        setNotifications([bonusNotif, ...notifications]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Schedule Call
  const handleScheduleCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedClientId || !schedDate || !schedNotes) return;

    try {
      const targetClient = clients.find(c => c.id === schedClientId);
      const res = await fetch(`/api/clients/${schedClientId}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-current-user': currentUser?.name || 'Administrator'
        },
        body: JSON.stringify({
          date: schedDate,
          time: schedTime || '10:00',
          notes: schedNotes
        })
      });

      if (res.ok) {
        setShowScheduleCall(false);
        setSchedClientId('');
        setSchedDate('');
        setSchedTime('');
        setSchedNotes('');
        loadCRMData();

        // Add visual alerts
        const pushCallAlert = {
          id: String(Date.now()),
          type: 'Reminder',
          title: 'Follow-Up Scheduled',
          body: `Remind call Touch base with ${targetClient?.name || 'Client'} scheduled on ${schedDate}.`,
          time: 'Just now',
          read: false
        };
        setNotifications([pushCallAlert, ...notifications]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add notes on arbitrary client from dashboard widget
  const handleAddNoteDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteClientId || !noteTitle || !noteText) return;

    try {
      const res = await fetch(`/api/clients/${noteClientId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-current-user': currentUser?.name || 'Administrator'
        },
        body: JSON.stringify({ title: noteTitle, description: noteText })
      });

      if (res.ok) {
        setShowAddNote(false);
        setNoteClientId('');
        setNoteTitle('');
        setNoteText('');
        loadCRMData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Client
  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this client portfolio from database registers? This action is non-reversible.')) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'x-current-user': currentUser?.name || 'Administrator'
        }
      });
      if (res.ok) {
        loadCRMData();
        setSelectedClientId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Sheets exporting module CSV/JSON Download implementation
  const handleExportSheet = (format: 'csv' | 'json', dataToExport: Client[]) => {
    const list = dataToExport.length > 0 ? dataToExport : clients;
    
    if (format === 'json') {
      const jsonStr = JSON.stringify(list, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SalesCore_CRM_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      return;
    }

    // Dynamic headers mapping
    const headers = ['Client ID', 'Client Name', 'Company Name', 'Email', 'Phone', 'WhatsApp', 'Industry', 'Website', 'Status', 'Priority', 'Lead Source', 'Assigned To', 'Budget ($)', 'Expected Revenue ($)', 'Target Deadline'];
    const rows = list.map(c => [
      c.id,
      c.name,
      c.companyName,
      c.email,
      c.phone,
      c.whatsApp,
      c.industry,
      c.website,
      c.status,
      c.priority,
      c.leadSource,
      c.assignedTo,
      c.budget,
      c.expectedRevenue,
      c.deadline
    ]);

    // Construct comma values
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SalesCore_CRM_Database_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Render components switcher based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <StatsDashboard
              stats={stats}
              recentClients={recentClients}
              upcomingReminders={upcomingReminders}
              onAddClient={() => setShowAddClient(true)}
              onScheduleCall={() => setShowScheduleCall(true)}
              onAddNote={() => setShowAddNote(true)}
              onExportAll={() => handleExportSheet('csv', clients)}
              onSelectClient={(id) => {
                setSelectedClientId(id);
                setActiveTab('clients');
              }}
              theme={theme}
            />
            {/* Embedded visually gorgeous dashboard analytics charts widget directly */}
            <div className="border-t border-slate-800/65 pt-8">
              <AnalyticsCharts stats={stats} theme={theme} />
            </div>
          </div>
        );

      case 'clients':
        if (selectedClientId) {
          return (
            <ClientDetailView
              clientId={selectedClientId}
              onClose={() => setSelectedClientId(null)}
              onUpdateClient={() => loadCRMData()}
            />
          );
        }
        return (
          <ClientsTable
            clients={clients}
            onSelectClient={(id) => setSelectedClientId(id)}
            onAddClient={() => setShowAddClient(true)}
            onDeleteClient={handleDeleteClient}
            onImportClick={() => setShowImport(true)}
            onExportClick={(filteredList) => handleExportSheet('csv', filteredList)}
          />
        );

      case 'projects':
        // Renders active projects with visual scroll progress bars
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
                Active Project Delivery
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time tracking of active contracts deliverables stages and executive progress bars.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800 mb-4">
                Active Client Roadmap Index
              </h2>
              {clients.filter(c => c.currentProject).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clients.filter(c => c.currentProject).map((client) => {
                    // Seeded percentage values matching IDs
                    const progressSeed = client.id === 'CLI-1001' ? 45 : (client.id === 'CLI-1002' ? 100 : 15);
                    const statusText = client.id === 'CLI-1002' ? 'Completed' : 'In Progress';
                    return (
                      <div 
                        key={client.id}
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setActiveTab('clients');
                        }}
                        className="bg-slate-950 p-5 rounded-2xl border border-slate-850 hover:border-slate-800 cursor-pointer active:translate-y-px transition-all space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-wide">{client.currentProject}</h3>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{client.companyName} Folder</span>
                          </div>
                          <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-bold ${
                            statusText === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                          }`}>
                            {statusText}
                          </span>
                        </div>

                        {/* project progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>Execution status</span>
                            <span className="font-mono text-indigo-455">{progressSeed}% done</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-lg overflow-hidden border border-slate-850">
                            <div className="bg-indigo-500 h-full rounded-lg" style={{ width: `${progressSeed}%` }} />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-850/50 text-[10px] text-slate-500 flex justify-between">
                          <span>Deadline: {client.deadline || 'Unscheduled'}</span>
                          <span className="text-indigo-400 font-bold">Open client card &bull;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-24 text-center text-slate-500 font-sans">
                  No active client projects currently registered. Create projects inside client workspace details.
                </div>
              )}
            </div>
          </div>
        );

      case 'calendar':
        return (
          <CalendarView
            stats={stats}
            onSelectClient={(id) => {
              setSelectedClientId(id);
              setActiveTab('clients');
            }}
            theme={theme}
          />
        );

      case 'activities':
        // Tracks detailed action logs from employee movements
        return (
          <div className="space-y-6 text-white font-sans animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                System Action Logs <History className="w-5 h-5 text-indigo-400" />
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Audit trial of every executive touch, status modifications, accounts, and communications.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-2">
                <span className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">Database Audit Trail</span>
                <span className="text-[10px] text-slate-500 font-semibold">{activityLogs.length} entries stored</span>
              </div>

              <div className="divide-y divide-slate-800/40 select-none">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
                    <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0">
                      <div className="flex gap-3 items-start min-w-0 pr-4">
                        <div className="h-8.5 w-8.5 shrink-0 rounded-lg bg-slate-950 border border-slate-850 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {log.user.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white transition-colors">
                            {log.user} <span className="text-slate-500 font-normal">&bull; {log.action}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 leading-normal mt-0.5 font-mono">{log.changesMade}</p>
                        </div>
                      </div>

                      <div className="shrink-0 text-left sm:text-right whitespace-nowrap">
                        <span className="text-[10px] text-slate-500 font-mono block font-medium">
                          {log.date} at {log.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center text-slate-500 italic text-xs">
                    Database trail is empty. Perform actions to seed logs!
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Redirect to sign in if no valid auth session exists
  if (!token) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen font-sans flex ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      
      {/* Primary Navigation Rail Sidebar */}
      <MainSidebar
        user={currentUser || { id: 'usr-guest', name: 'Guest Executive', email: 'guest@crm.com', role: 'Employee' }}
        activeTab={activeTab}
        setActiveTab={(t) => {
          setSelectedClientId(null);
          setActiveTab(t);
        }}
        onLogout={handleLogout}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
        setShowNotifications={setShowNotifications}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto px-8 py-8 md:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {renderTabContent()}
        </div>
      </main>

      {/* Notification Sliding Drawer overlay */}
      <NotificationCenter
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(notifications.map(n => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
      />

      {/* Import Workbook Deck Modal */}
      <ImportExportEngine
        showImport={showImport}
        onCloseImport={() => setShowImport(false)}
        onImportSuccess={(addedCount) => {
          setShowImport(false);
          loadCRMData();
          alert(`Import successful: ${addedCount} lead folder profiles populated!`);
        }}
        onExportFinish={(t, l) => handleExportSheet(t, l)}
      />

      {/* MODAL: ADD CLIENT LEAD DIALOG */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer" onClick={() => setShowAddClient(false)} />
          
          <form 
            onSubmit={handleCreateClientSubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-xl relative z-10 text-white text-xs space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Register business prospect</h2>
              <button 
                type="button" 
                onClick={() => setShowAddClient(false)}
                className="p-1 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Contact Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCName}
                  onChange={(e) => setNewCName(e.target.value)}
                  placeholder="e.g. Timothy Vance"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Corporate Entity Name *</label>
                <input
                  type="text"
                  required
                  value={newCCompany}
                  onChange={(e) => setNewCCompany(e.target.value)}
                  placeholder="e.g. Hexagon Dynamics"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Prospect Email Address *</label>
                <input
                  type="email"
                  required
                  value={newCEmail}
                  onChange={(e) => setNewCEmail(e.target.value)}
                  placeholder="vance@hexagon.com"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Telephone Phone</label>
                <input
                  type="text"
                  value={newCPhone}
                  onChange={(e) => setNewCPhone(e.target.value)}
                  placeholder="+1 (555) 750-1288"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">WhatsApp Number</label>
                <input
                  type="text"
                  value={newCWhatsApp}
                  onChange={(e) => setNewCWhatsApp(e.target.value)}
                  placeholder="+1 (555) 750-1288"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Company Web portal URL</label>
                <input
                  type="text"
                  value={newCWebsite}
                  onChange={(e) => setNewCWebsite(e.target.value)}
                  placeholder="https://hexagon.com"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Business sector</label>
                <input
                  type="text"
                  value={newCIndustry}
                  onChange={(e) => setNewCIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Assigned Executive Owner</label>
                <select
                  value={newCAssignedTo}
                  onChange={(e) => setNewCAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 outline-none text-slate-350 focus:border-indigo-500 text-xs font-bold"
                >
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (Admin)</option>
                </select>
              </div>

              <div className="col-span-2 border-t border-slate-850/60 pt-3">
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Requested Service Scope description</label>
                <textarea
                  value={newCServices}
                  onChange={(e) => setNewCServices(e.target.value)}
                  rows={2}
                  placeholder="Summarize technical requests parameters..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500 font-sans resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Initial Budget ($)</label>
                <input
                  type="number"
                  value={newCBudget}
                  onChange={(e) => setNewCBudget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Lead pipeline status</label>
                <select
                  value={newCStatus}
                  onChange={(e) => setNewCStatus(e.target.value as ClientStatus)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-slate-300 focus:border-indigo-500 text-xs font-bold"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Called">Called</option>
                  <option value="Follow Up Required">Follow Up Required</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Work In Progress">Work In Progress</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5">
              <button 
                type="button" 
                onClick={() => setShowAddClient(false)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer text-slate-405 hover:text-white"
              >
                Discard Prospect
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                Assemble Lead Portfolio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: SCHEDULE CALL OR FOLLOW UP REMINDERS */}
      {showScheduleCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer" onClick={() => setShowScheduleCall(false)} />
          
          <form 
            onSubmit={handleScheduleCallSubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md relative z-10 text-white text-xs space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Schedule Follow-up Call</h2>
              <button 
                type="button" 
                onClick={() => setShowScheduleCall(false)}
                className="p-1 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Select Targeted Prospect *</label>
                <select
                  required
                  value={schedClientId}
                  onChange={(e) => setSchedClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 outline-none text-slate-300 focus:border-indigo-500 mt-1"
                >
                  <option value="">-- Choose client profile --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 outline-none text-slate-400 focus:border-indigo-500 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Call Time Slot</label>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 outline-none text-slate-400 focus:border-indigo-500 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Pre-call Agenda agenda *</label>
                <textarea
                  required
                  value={schedNotes}
                  onChange={(e) => setSchedNotes(e.target.value)}
                  rows={3}
                  placeholder="Write clear talking points or follow up triggers..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500 font-sans mt-1 resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5 mt-2">
              <button 
                type="button" 
                onClick={() => setShowScheduleCall(false)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-805 rounded-xl font-semibold text-slate-400 hover:text-white"
              >
                Discard
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 rounded-xl font-bold text-white shadow-lg cursor-pointer"
              >
                Log Reminders Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD INTERNAL NOTE DIRECTLY */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer" onClick={() => setShowAddNote(false)} />
          
          <form 
            onSubmit={handleAddNoteDashboard}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md relative z-10 text-white text-xs space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Log Account note</h2>
              <button 
                type="button" 
                onClick={() => setShowAddNote(false)}
                className="p-1 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Select Targeted Prospect *</label>
                <select
                  required
                  value={noteClientId}
                  onChange={(e) => setNoteClientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 outline-none text-slate-300 focus:border-indigo-500 mt-1"
                >
                  <option value="">-- Choose client profile --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Notes Title *</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Invoicing details or custom telepathy integration notes"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500 mt-1"
                />
              </div>

              <div>
                <label className="block text-slate-450 uppercase font-semibold pb-1 tracking-widest text-[9px]">Notes Narrative *</label>
                <textarea
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                  placeholder="Narrate details..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none text-white focus:border-indigo-500 font-sans mt-1 resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5 mt-2">
              <button 
                type="button" 
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-805 rounded-xl font-semibold text-slate-400 hover:text-white"
              >
                Discard
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 rounded-xl font-bold text-white shadow-lg cursor-pointer"
              >
                Write Saved Note
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
