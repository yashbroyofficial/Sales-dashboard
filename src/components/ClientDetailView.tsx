import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  CheckCircle, 
  Calendar, 
  Tag, 
  User, 
  DollarSign, 
  Clock, 
  Paperclip, 
  MessageSquare, 
  Plus, 
  Trash2, 
  FileText, 
  TrendingUp,
  Settings2,
  Edit2,
  Check,
  Send,
  PhoneCall,
  Video,
  ListTodo
} from 'lucide-react';
import { 
  Client, 
  Communication, 
  Project, 
  ClientNote, 
  ClientDocument, 
  Reminder,
  ClientStatus,
  ClientPriority,
  LeadSource,
  CommType,
  ProjectStatus
} from '../types.js';

interface ClientDetailViewProps {
  clientId: string;
  onClose: () => void;
  onUpdateClient: (updatedClient: Client) => void;
}

export default function ClientDetailView({
  clientId,
  onClose,
  onUpdateClient
}: ClientDetailViewProps) {
  const [clientDetail, setClientDetail] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'comms' | 'projects' | 'documents' | 'notes'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form states for edits
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsApp, setEditWhatsApp] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editStatus, setEditStatus] = useState<ClientStatus>('New Lead');
  const [editPriority, setEditPriority] = useState<ClientPriority>('Medium');
  const [editAssignedTo, setEditAssignedTo] = useState('John Doe');
  const [editBudget, setEditBudget] = useState(0);
  const [editExpRev, setEditExpRev] = useState(0);
  const [editStart, setEditStart] = useState('');
  const [editDead, setEditDead] = useState('');
  const [editService, setEditService] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Communicator inserters
  const [commType, setCommType] = useState<CommType>('Call');
  const [commNotes, setCommNotes] = useState('');
  const [commSubject, setCommSubject] = useState('');
  const [commMessage, setCommMessage] = useState('');
  const [commDuration, setCommDuration] = useState('10m');

  // Notes inserters
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');

  // Projects states
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projDeliv, setProjDeliv] = useState('');
  const [projDue, setProjDue] = useState('');

  // Reminders states
  const [remDate, setRemDate] = useState('');
  const [remTime, setRemTime] = useState('');
  const [remNotes, setRemNotes] = useState('');

  // Active user role log spoof
  const currentExec = 'Sarah Jenkins';

  const fetchClientRecord = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      const data = await response.json();
      setClientDetail(data);

      // Map values
      setEditName(data.name || '');
      setEditCompany(data.companyName || '');
      setEditEmail(data.email || '');
      setEditPhone(data.phone || '');
      setEditWhatsApp(data.whatsApp || '');
      setEditCity(data.city || '');
      setEditState(data.state || '');
      setEditCountry(data.country || '');
      setEditWebsite(data.website || '');
      setEditIndustry(data.industry || '');
      setEditStatus(data.status || 'New Lead');
      setEditPriority(data.priority || 'Medium');
      setEditAssignedTo(data.assignedTo || 'John Doe');
      setEditBudget(data.budget || 0);
      setEditExpRev(data.expectedRevenue || 0);
      setEditStart(data.startDate || '');
      setEditDead(data.deadline || '');
      setEditService(data.serviceRequired || '');
      setEditDesc(data.projectDescription || '');
    } catch (err) {
      console.error('Failed to query individual client cards', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchClientRecord();
  }, [clientId]);

  if (isLoading || !clientDetail) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold font-sans uppercase tracking-widest text-slate-500">Querying Client pipeline records...</span>
      </div>
    );
  }

  // Edit Submit API call
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...clientDetail,
        name: editName,
        companyName: editCompany,
        email: editEmail,
        phone: editPhone,
        whatsApp: editWhatsApp,
        city: editCity,
        state: editState,
        country: editCountry,
        website: editWebsite,
        industry: editIndustry,
        status: editStatus,
        priority: editPriority,
        assignedTo: editAssignedTo,
        budget: Number(editBudget),
        expectedRevenue: Number(editExpRev),
        startDate: editStart,
        deadline: editDead,
        serviceRequired: editService,
        projectDescription: editDesc
      };

      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-current-user': currentExec
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update.');

      const finalized = await response.json();
      setClientDetail({
        ...clientDetail,
        ...finalized
      });
      onUpdateClient(finalized);
      setIsEditing(false);
    } catch (err) {
      alert('Error updating business lead: ' + err);
    }
  };

  // Log Call/Mail/Meeting
  const handleAddComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commNotes) return;

    try {
      const newComm = {
        type: commType,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        duration: commType === 'Call' ? commDuration : undefined,
        subject: commType === 'Email' ? commSubject : undefined,
        message: (commType === 'Email' || commType === 'WhatsApp') ? commMessage : undefined,
        notes: commNotes,
        status: 'Completed'
      };

      const res = await fetch(`/api/clients/${clientId}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-current-user': currentExec
        },
        body: JSON.stringify(newComm)
      });

      if (res.ok) {
        const addedComm = await res.json();
        setClientDetail({
          ...clientDetail,
          communications: [addedComm, ...(clientDetail.communications || [])]
        });
        setCommNotes('');
        setCommSubject('');
        setCommMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add internal notes file
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteDesc) return;

    try {
      const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-current-user': currentExec
        },
        body: JSON.stringify({ title: noteTitle, description: noteDesc })
      });

      if (res.ok) {
        const addedNote = await res.json();
        setClientDetail({
          ...clientDetail,
          notes: [addedNote, ...(clientDetail.notes || [])]
        });
        setNoteTitle('');
        setNoteDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add micro projects deliveries
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projDesc) return;

    try {
      const res = await fetch(`/api/clients/${clientId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-current-user': currentExec
        },
        body: JSON.stringify({
          projectName: projName,
          description: projDesc,
          deliverables: projDeliv,
          progress: 10,
          dueDate: projDue,
          status: 'Not Started'
        })
      });

      if (res.ok) {
        const addedProj = await res.json();
        setClientDetail({
          ...clientDetail,
          projects: [...(clientDetail.projects || []), addedProj]
        });
        setProjName('');
        setProjDesc('');
        setProjDeliv('');
        setProjDue('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update micro project percentage progress slider
  const handleUpdateProjProgress = async (projId: string, progress: number, status: ProjectStatus) => {
    try {
      const res = await fetch(`/api/projects/${projId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-current-user': currentExec
        },
        body: JSON.stringify({ progress, status })
      });

      if (res.ok) {
        const updated = await res.json();
        const adjustedProjects = clientDetail.projects.map((p: Project) => p.id === projId ? updated : p);
        setClientDetail({
          ...clientDetail,
          projects: adjustedProjects
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add follow-up reminders
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remDate || !remNotes) return;

    try {
      const res = await fetch(`/api/clients/${clientId}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-current-user': currentExec
        },
        body: JSON.stringify({
          date: remDate,
          time: remTime || '10:00',
          notes: remNotes
        })
      });

      if (res.ok) {
        const addedRem = await res.json();
        setClientDetail({
          ...clientDetail,
          reminders: [addedRem, ...(clientDetail.reminders || [])]
        });
        setRemDate('');
        setRemTime('');
        setRemNotes('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Reminder Status completed
  const handleToggleReminder = async (remId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/reminders/${remId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-current-user': currentExec
        },
        body: JSON.stringify({ completed })
      });

      if (res.ok) {
        const updated = await res.json();
        const adjustedRem = clientDetail.reminders.map((r: Reminder) => r.id === remId ? updated : r);
        setClientDetail({
          ...clientDetail,
          reminders: adjustedRem
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Document attachment upload system
  const handleSimulatedFileUpload = () => {
    const fileOptions = [
      { name: 'Invoicing_Plan_NDA.pdf', type: 'PDF', size: '1.2 MB' },
      { name: 'Business_Requirements_Matrix.xlsx', type: 'XLSX', size: '540 KB' },
      { name: 'UX_Concept_Layout.jpg', type: 'JPG', size: '2.1 MB' },
      { name: 'Project_Initiation_Approved.pdf', type: 'PDF', size: '940 KB' }
    ];

    const pick = fileOptions[Math.floor(Math.random() * fileOptions.length)];
    
    fetch(`/api/clients/${clientId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-current-user': currentExec
      },
      body: JSON.stringify({
        name: `${pick.name}`,
        type: pick.type,
        size: pick.size,
        url: '#'
      })
    })
    .then(res => res.json())
    .then(addedDoc => {
      setClientDetail({
        ...clientDetail,
        documents: [addedDoc, ...(clientDetail.documents || [])]
      });
    });
  };

  return (
    <div className="space-y-6 text-white max-w-5xl mx-auto animate-fade-in">
      {/* Header Back panel */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onClose}
          className="flex items-center gap-2 group text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          Back to list
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 font-semibold font-mono">
            Client Folder: {clientDetail.id}
          </span>
        </div>
      </div>

      {/* Top Banner section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Absolute glow design elements */}
        <div className="absolute -right-32 -top-32 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
        
        <div className="flex gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-2xl shadow-inner">
            {clientDetail.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none">{clientDetail.name}</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {clientDetail.companyName} &bull; <span className="text-slate-500 font-normal">{clientDetail.industry}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                clientDetail.status === 'Converted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                clientDetail.status === 'Failed' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                clientDetail.status === 'Work In Progress' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' :
                'bg-slate-850 border-slate-755 text-slate-400'
              }`}>
                {clientDetail.status}
              </span>

              <span className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-500" /> Source: {clientDetail.leadSource}
              </span>
              
              <span className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" /> Account Owner: {clientDetail.assignedTo}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setActiveSubTab('profile');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-850 hover:bg-slate-800 border border-slate-700/80 active:translate-y-px transition-all cursor-pointer whitespace-nowrap self-start md:self-center"
        >
          {isEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-4 h-4 text-slate-400" />}
          {isEditing ? 'Editing Profile' : 'Modify Information'}
        </button>
      </div>

      {/* Tabs list menu */}
      <div className="border-b border-slate-800 flex flex-wrap gap-2">
        {(['profile', 'comms', 'projects', 'documents', 'notes'] as const).map((tab) => {
          const labels = {
            profile: 'Client Details & Information',
            comms: 'Timeline & communications',
            projects: 'Deliverables & Projects',
            documents: 'Document safe',
            notes: 'Internal Staff Notes'
          };
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveSubTab(tab);
                if (tab !== 'profile') setIsEditing(false);
              }}
              className={`text-xs font-semibold px-4 py-3 leading-none border-b-2 tracking-wide -mb-px transition-all cursor-pointer ${
                activeSubTab === tab 
                  ? 'border-indigo-500 text-white font-bold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* 1. PROFILE DETAIL TAB */}
      {activeSubTab === 'profile' && !isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl md:col-span-2 space-y-6 shadow-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
              Basic Account Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Company website</span>
                <a 
                  href={clientDetail.website} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  {clientDetail.website || 'No website registered'}
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Business sector / Industry</span>
                <span className="text-slate-200 font-bold">{clientDetail.industry || 'Unspecified'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Business Scale</span>
                <span className="text-slate-200 font-medium">{clientDetail.companySize || 'Unspecified'} employees</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Business model</span>
                <span className="text-slate-200 font-medium">{clientDetail.businessType || 'Unspecified'}</span>
              </div>

              <div className="sm:col-span-2 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Corporate Headquarters</span>
                <span className="text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {clientDetail.address ? `${clientDetail.address}, ${clientDetail.city}, ${clientDetail.state}, ${clientDetail.country}` : 'Not registered'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/60 block">
              <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider pb-2">Requested Service Scope</h4>
              <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800/80 leading-relaxed font-mono">
                <span className="block font-bold text-white text-xs mb-2">{clientDetail.serviceRequired || 'No service description submitted'}</span>
                {clientDetail.projectDescription || 'Detailed specifications and architectural parameters have not been compiled.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Contact info card panel */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4.5 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Core Contact Details
              </h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8.5 w-8.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Personal email</span>
                    <a href={`mailto:${clientDetail.email}`} className="text-indigo-400 hover:underline hover:text-indigo-300 block font-semibold truncate max-w-[170px]">{clientDetail.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8.5 w-8.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Telephone phone</span>
                    <span className="text-slate-200 font-bold block">{clientDetail.phone || 'None'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8.5 w-8.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-500 block">WhatsApp instant message</span>
                    <span className="text-emerald-400 font-bold block">{clientDetail.whatsApp || 'Unspecified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoicing info card panel */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4.5 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Budgetary Projection
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Total Budget</span>
                  <span className="text-white text-lg font-bold font-mono tracking-tight text-indigo-400">
                    ${clientDetail.budget ? clientDetail.budget.toLocaleString() : '0'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Expected Revenue</span>
                  <span className="text-white text-lg font-bold font-mono tracking-tight text-emerald-400">
                    ${clientDetail.expectedRevenue ? clientDetail.expectedRevenue.toLocaleString() : '0'}
                  </span>
                </div>
                <div className="col-span-2 border-t border-slate-800/60 pt-3">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">Target Deliveries Cycle</span>
                  <p className="text-slate-350 text-[11px] font-medium flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {clientDetail.startDate ? `${clientDetail.startDate} to ${clientDetail.deadline}` : 'Cycle not mapped'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE EDIT FORM PANEL EDITING TAB */}
      {activeSubTab === 'profile' && isEditing && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Profile Configuration Manager
            </h3>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase animate-pulse">Save changes before returning</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4 text-xs">
              <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">General Lead Profile Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Client Contact Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Corporate Entity Name</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Primary Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Primary Phone (Tel)</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editWhatsApp}
                    onChange={(e) => setEditWhatsApp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Corporate Website URL</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
              </div>

              <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] pt-4">Location Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">State</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
              </div>

              <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] pt-4">Service & Project Scope Specs</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Core Service Required</label>
                  <input
                    type="text"
                    value={editService}
                    onChange={(e) => setEditService(e.target.value)}
                    placeholder="e.g. Cloud Security Integration Strategy"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Project Detail Specifications Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-xs text-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right sidebar options for statuses */}
            <div className="space-y-4 text-xs">
              <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sales Pipeline parameters</h4>
              
              <div>
                <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Pipeline Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ClientStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-xs text-slate-300"
                >
                  <option value="New Lead">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Called">Called</option>
                  <option value="Follow Up Required">Follow Up Required</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Work In Progress">Work In Progress</option>
                  <option value="Converted">Converted</option>
                  <option value="Failed">Failed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Lead Priority Action Level</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as ClientPriority)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-xs text-slate-300"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium pb-1.5 uppercase tracking-widest text-[9px]">Assigned Executive Staff</label>
                <select
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 text-xs text-slate-300"
                >
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (Admin)</option>
                </select>
              </div>

              <div className="border-t border-slate-800/60 pt-4 space-y-4">
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Financial projection parameters</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium pb-1 uppercase tracking-widest text-[9px]">Budget ($)</label>
                    <input
                      type="number"
                      value={editBudget}
                      onChange={(e) => setEditBudget(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 outline-none text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium pb-1 uppercase tracking-widest text-[9px]">Expected Rev ($)</label>
                    <input
                      type="number"
                      value={editExpRev}
                      onChange={(e) => setEditExpRev(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 outline-none text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium pb-1 uppercase tracking-widest text-[9px]">Start Date</label>
                    <input
                      type="date"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 outline-none text-xs text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium pb-1 uppercase tracking-widest text-[9px]">Target Deadline</label>
                    <input
                      type="date"
                      value={editDead}
                      onChange={(e) => setEditDead(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 outline-none text-xs text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Save actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer text-slate-400 hover:text-white transition-colors"
            >
              Discard Edits
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer"
            >
              Commit Dynamic Changes
            </button>
          </div>
        </form>
      )}

      {/* 3. COMMUNICATION HISTORY TAB WITH INTEGRATED REMINDERS */}
      {activeSubTab === 'comms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Timeline Feed column */}
          <div className="md:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Interaction Timeline
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{clientDetail.communications?.length || 0} interaction logs found</span>
            </div>

            {/* Conversation Timeline Cards */}
            <div className="space-y-5 select-none relative pl-4 border-l border-slate-800">
              {clientDetail.communications && clientDetail.communications.length > 0 ? (
                clientDetail.communications.map((comm: Communication) => (
                  <div key={comm.id} className="relative group bg-slate-950 p-4 border border-slate-850 rounded-xl hover:border-slate-800 transition-colors">
                    {/* timeline node icon indicator */}
                    <div className="absolute -left-[27px] top-4.5 h-5 w-5 rounded-full bg-slate-900 border-2 border-slate-800 text-indigo-400 flex items-center justify-center text-[10px]">
                      {comm.type === 'Call' ? <PhoneCall className="w-2.5 h-2.5 text-sky-400" /> :
                       comm.type === 'Meeting' ? <Video className="w-2.5 h-2.5 text-amber-500" /> :
                       comm.type === 'Email' ? <Send className="w-2.5 h-2.5 text-indigo-400" /> :
                       <MessageSquare className="w-2.5 h-2.5 text-emerald-400" />}
                    </div>

                    <div className="flex items-center justify-between font-sans">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{comm.type} Log</span>
                        {comm.duration && (
                          <span className="text-[10px] text-slate-500 font-semibold font-mono bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded-md">
                            Duration: {comm.duration}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">{comm.date} &bull; {comm.time}</span>
                    </div>

                    {comm.subject && (
                      <p className="text-xs font-bold text-slate-300 mt-2 font-sans">{comm.subject}</p>
                    )}

                    {comm.message && (
                      <p className="text-xs text-slate-400 mt-1 pl-2.5 border-l border-slate-850/80 leading-relaxed max-w-prose">{comm.message}</p>
                    )}

                    <p className="text-xs text-slate-350 mt-2.5 bg-slate-900/40 p-3 rounded-lg border border-slate-850/50 leading-relaxed font-mono">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Timeline Notes:</span>
                      {comm.notes}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <span className="text-xs font-semibold block">Timeline has not been initialized.</span>
                  <p className="text-[10px] text-slate-600 mt-1">Submit conversations on the sidebar form panels.</p>
                </div>
              )}
            </div>
          </div>

          {/* Log interaction forms panel side */}
          <div className="space-y-6">
            
            {/* Form to submit interaction logs */}
            <form onSubmit={handleAddComm} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center gap-2">
                Log CRM Interaction
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-widest text-[9px]">Communication Type</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Call', 'Meeting', 'Email', 'WhatsApp'] as CommType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCommType(type)}
                        className={`py-2 text-[10px] font-bold rounded-xl border tracking-wide cursor-pointer text-center ${
                          commType === type 
                            ? 'bg-indigo-600 text-white border-indigo-500 font-bold' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {commType === 'Call' && (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Call Duration</label>
                    <input
                      type="text"
                      value={commDuration}
                      onChange={(e) => setCommDuration(e.target.value)}
                      placeholder="e.g. 15m or 5m 23s"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                )}

                {commType === 'Email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Subject Header</label>
                      <input
                        type="text"
                        value={commSubject}
                        onChange={(e) => setCommSubject(e.target.value)}
                        placeholder="e.g. Project scope contract document review"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Message Body Text</label>
                      <textarea
                        value={commMessage}
                        onChange={(e) => setCommMessage(e.target.value)}
                        rows={3}
                        placeholder="Write dynamic mail communications template..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white resize-none"
                      />
                    </div>
                  </div>
                )}

                {commType === 'WhatsApp' && (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">WhatsApp Chat Snippet</label>
                    <textarea
                      value={commMessage}
                      onChange={(e) => setCommMessage(e.target.value)}
                      rows={3}
                      placeholder="Copied WhatsApp dialogue notes..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Interactions Notes Summary</label>
                  <textarea
                    value={commNotes}
                    onChange={(e) => setCommNotes(e.target.value)}
                    rows={4}
                    placeholder="Wrote internal notes outlining the exact outcome of conversations..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-655 hover:bg-indigo-600 rounded-xl font-bold text-xs text-white shadow-md active:translate-y-px transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Save Interactions Event
                </button>
              </div>
            </form>

            {/* Form to submit Follow-up Calendar reminders */}
            <form onSubmit={handleAddReminder} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center gap-2">
                Schedule Follow-up Event
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Reminders Date</label>
                    <input
                      type="date"
                      value={remDate}
                      onChange={(e) => setRemDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Appointment Time</label>
                    <input
                      type="time"
                      value={remTime}
                      onChange={(e) => setRemTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Reminders Notes Details</label>
                  <textarea
                    value={remNotes}
                    onChange={(e) => setRemNotes(e.target.value)}
                    rows={2}
                    placeholder="Target objectives for this follow-up..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-sm active:translate-y-px transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-slate-400" /> Schedule Reminders
                </button>
              </div>

              {/* Collapsed view of active reminder lists */}
              {clientDetail.reminders && clientDetail.reminders.length > 0 && (
                <div className="pt-3 border-t border-slate-800/60 font-sans">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Reminders Scheduled</span>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {clientDetail.reminders.map((rem: Reminder) => (
                      <div key={rem.id} className="flex items-start gap-2 bg-slate-950 p-2 rounded-lg border border-slate-850">
                        <input
                          type="checkbox"
                          checked={rem.completed}
                          onChange={(e) => handleToggleReminder(rem.id, e.target.checked)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <div className="truncate flex-1">
                          <p className={`text-[10px] font-medium leading-tight truncate ${rem.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                            {rem.notes}
                          </p>
                          <span className="text-[8px] text-slate-500 block font-mono mt-0.5">{rem.date} {rem.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

          </div>
        </div>
      )}

      {/* 4. ACTIVE PROJECTS ROADMAP TAB */}
      {activeSubTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center gap-2">
              Deliverables & active Projects
            </h3>

            {/* List of active projects with progress sliders! */}
            <div className="space-y-6">
              {clientDetail.projects && clientDetail.projects.length > 0 ? (
                clientDetail.projects.map((proj: Project) => (
                  <div key={proj.id} className="bg-slate-950 p-5 border border-slate-850 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-wide">{proj.projectName}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{proj.description}</p>
                      </div>
                      <select
                        value={proj.status}
                        onChange={(e) => handleUpdateProjProgress(proj.id, proj.progress, e.target.value as ProjectStatus)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] outline-none text-slate-350 self-start sm:self-center font-bold"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    <p className="text-xs text-slate-350 bg-slate-900/60 p-3 rounded-lg border border-slate-850/50 leading-relaxed font-mono">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Scope Deliverables:</span>
                      {proj.deliverables || 'No specific deliverables files mapped.'}
                    </p>

                    {/* Progress slider bar implementation */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-500 uppercase tracking-wider">Project execution scale</span>
                        <span className="font-mono font-bold text-indigo-400">{proj.progress}% Completed</span>
                      </div>
                      
                      <div className="relative">
                        {/* Custom interactive progress slider */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={proj.progress}
                          onChange={(e) => handleUpdateProjProgress(proj.id, parseInt(e.target.value), proj.status)}
                          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg outline-none"
                        />
                        {/* High fidelity track */}
                        <div 
                          style={{ width: `${proj.progress}%` }} 
                          className="h-1.5 bg-indigo-500 absolute top-1.5 left-0 rounded-lg pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-850/50 pt-3">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-550" />
                        Target Due Date: {proj.dueDate || 'Unspecified'}
                      </span>
                      <span className="font-mono text-indigo-400 hover:underline cursor-pointer">Verify requirements &bull;</span>
                    </div>

                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 bg-slate-950 p-6 rounded-2xl border border-slate-850/60">
                  <ListTodo className="w-8 h-8 text-slate-650 mx-auto mb-2.5 animate-pulse-slow" />
                  <span className="text-xs font-semibold block text-slate-400">There are no active projects associated.</span>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                    Kicking off project pipelines automatically compiles tracking bars and schedule logs!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* New Project Kicker form panel */}
          <div className="space-y-6">
            <form onSubmit={handleAddProject} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Kick off New Project
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Project Name</label>
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. Cloud Security Integration Strategy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Technical Description</label>
                  <textarea
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    rows={3}
                    placeholder="Write details of active service execution..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Scope deliverables</label>
                  <textarea
                    value={projDeliv}
                    onChange={(e) => setProjDeliv(e.target.value)}
                    rows={2}
                    placeholder="e.g. Terraform architecture diagrams, safe vaults configs..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase tracking-widest text-[9px]">Delivery Due Date</label>
                  <input
                    type="date"
                    value={projDue}
                    onChange={(e) => setProjDue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs text-white shadow-md active:translate-y-px transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Kicked Off Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. DOCUMENT SAFE FILE VAULT TAB */}
      {activeSubTab === 'documents' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Document vault safe
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Upload simulated PDF, DOCX, XLSX contracts and design assets here.</p>
            </div>

            <button
              onClick={handleSimulatedFileUpload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold cursor-pointer active:translate-y-px transition-all"
            >
              <Paperclip className="w-4 h-4 text-slate-400 animate-bounce-slow" /> Simulated File Upload
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {clientDetail.documents && clientDetail.documents.length > 0 ? (
              clientDetail.documents.map((doc: ClientDocument) => (
                <div key={doc.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl hover:border-slate-800 transition-colors flex flex-col justify-between h-36">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                        doc.type === 'PDF' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                        doc.type === 'XLSX' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                        doc.type === 'DOCX' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' :
                        'bg-slate-800 border-slate-700 text-slate-450'
                      }`}>
                        {doc.type} File
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{doc.size}</span>
                    </div>
                    <p className="text-xs font-bold text-white tracking-wide mt-3 truncate" title={doc.name}>{doc.name}</p>
                  </div>

                  <div className="border-t border-slate-850/55 pt-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Uploaded {doc.uploadDate}</span>
                    <a href={doc.url} className="text-indigo-400 font-bold hover:underline">Download</a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
                <Paperclip className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                <span className="text-xs font-semibold block">Empty account vault</span>
                <p className="text-[10px] text-slate-600 mt-1 max-w-xs mx-auto">
                  Click the simulated upload button above to automatically append files to this portfolio.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. STAFF NOTES PRIVATE WORKSPACE TAB */}
      {activeSubTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
              Private Internal Notes
            </h3>

            <div className="space-y-4">
              {clientDetail.notes && clientDetail.notes.length > 0 ? (
                clientDetail.notes.map((note: ClientNote) => (
                  <div key={note.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white leading-normal uppercase">{note.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(note.dateAdded).toLocaleDateString()}</span>
                    </div>
                    
                    <p className="text-xs text-slate-300 leading-relaxed max-w-prose whitespace-pre-wrap">{note.description}</p>
                    
                    <div className="border-t border-slate-850/50 pt-2 flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase">
                      <User className="w-3.5 h-3.5" /> Created By: {note.createdBy}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 bg-slate-950 rounded-2xl text-center text-slate-500 border border-slate-850">
                  <FileText className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                  <span className="text-xs font-semibold block">No notes found</span>
                  <p className="text-[10px] text-slate-500 mt-1">Submit private logs on the sidebar workspace form panels.</p>
                </div>
              )}
            </div>
          </div>

          {/* Note Logger element */}
          <div className="space-y-6">
            <form onSubmit={handleAddNote} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center gap-2">
                Write Account Note
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1 uppercase tracking-widest text-[9px]">Note Title</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Critical key constraints checklist"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1 uppercase tracking-widest text-[9px]">Account Description Details</label>
                  <textarea
                    value={noteDesc}
                    onChange={(e) => setNoteDesc(e.target.value)}
                    rows={6}
                    placeholder="Wrote internal notes outlining exact account specs or private comments..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl font-bold text-xs text-white shadow-md cursor-pointer active:translate-y-px transition-all"
                >
                  <Plus className="w-4 h-4" /> Save Account Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
