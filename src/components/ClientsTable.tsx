import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronUp, 
  ArrowUpDown, 
  Plus, 
  Download, 
  Upload, 
  Trash2,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import { Client, ClientStatus, ClientPriority, LeadSource } from '../types.js';

interface ClientsTableProps {
  clients: Client[];
  onSelectClient: (id: string) => void;
  onAddClient: () => void;
  onDeleteClient: (id: string) => void;
  onImportClick: () => void;
  onExportClick: (filteredClients: Client[]) => void;
}

export default function ClientsTable({
  clients,
  onSelectClient,
  onAddClient,
  onDeleteClient,
  onImportClick,
  onExportClick
}: ClientsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [assignedFilter, setAssignedFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Filter & sort client records client-side for dynamic feedback
  const filteredClients = clients
    .filter((client) => {
      const matchSearch = 
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.companyName.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.phone.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === '' || client.status === statusFilter;
      const matchPriority = priorityFilter === '' || client.priority === priorityFilter;
      const matchSource = sourceFilter === '' || client.leadSource === sourceFilter;
      const matchAssigned = assignedFilter === '' || client.assignedTo === assignedFilter;

      return matchSearch && matchStatus && matchPriority && matchSource && matchAssigned;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'revenue':
          return b.expectedRevenue - a.expectedRevenue;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.id.localeCompare(a.id);
      }
    });

  const statuses: ClientStatus[] = [
    'New Lead', 'Contacted', 'Called', 'Follow Up Required', 
    'Proposal Sent', 'Work In Progress', 'Converted', 'Failed', 'Closed'
  ];

  const priorities: ClientPriority[] = ['High', 'Medium', 'Low'];
  
  const sources: LeadSource[] = [
    'Website', 'Referral', 'Instagram', 'Facebook', 'LinkedIn', 'WhatsApp', 'Cold Calling', 'Other'
  ];

  const employees = ['John Doe', 'Jane Smith', 'Sarah Jenkins'];

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setSourceFilter('');
    setAssignedFilter('');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white font-sans flex items-center gap-2">
            Client Lead Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Complete database grid of prospective accounts, filter lists, and bulk imports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onImportClick}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-705 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer active:translate-y-px transition-all"
          >
            <Upload className="w-4 h-4 text-slate-400" /> Import
          </button>
          <button
            onClick={() => onExportClick(filteredClients)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-705 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer active:translate-y-px transition-all"
          >
            <Download className="w-4 h-4 text-slate-400" /> Export Sheet
          </button>
          <button
            onClick={onAddClient}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer active:translate-y-px transition-shadow"
          >
            <Plus className="w-4 h-4" /> Add Lead Profile
          </button>
        </div>
      </div>

      {/* Filter and sorting control deck */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
          
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by Name, Company, Email, or Phone..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Quick-Sort drop-down */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500"
            >
              <option value="newest">Sort: Created Date (Newest)</option>
              <option value="oldest">Sort: Created Date (Oldest)</option>
              <option value="revenue">Sort: Expected Revenue</option>
              <option value="name">Sort: Client Name</option>
            </select>
          </div>
        </div>

        {/* Dynamic drop-down search tags filter bar */}
        <div className="flex flex-wrap md:items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Picker */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs outline-none text-slate-300"
            >
              <option value="">All Statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Priority Picker */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs outline-none text-slate-300"
            >
              <option value="">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Source Picker */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs outline-none text-slate-300"
            >
              <option value="">All Lead Sources</option>
              {sources.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>

            {/* Assigned Executive Picker */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs outline-none text-slate-300"
            >
              <option value="">All Executives</option>
              {employees.map((emp) => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          {(search || statusFilter || priorityFilter || sourceFilter || assignedFilter || sortBy !== 'newest') && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-450 hover:text-rose-400 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Database client-records Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/40">
                <th className="px-6 py-4.5">Client ID</th>
                <th className="px-6 py-4.5">Business Name</th>
                <th className="px-6 py-4.5">Contact Detail</th>
                <th className="px-6 py-4.5">Account Industry</th>
                <th className="px-6 py-4.5">Pipeline Status</th>
                <th className="px-6 py-4.5">Priority</th>
                <th className="px-6 py-4.5">Budget</th>
                <th className="px-6 py-4.5">Owner</th>
                <th className="px-6 py-4.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr 
                    key={client.id}
                    onClick={() => onSelectClient(client.id)}
                    className="hover:bg-slate-850/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4.5 font-mono font-medium text-slate-400 group-hover:text-indigo-400 transition-colors">
                      {client.id}
                    </td>
                    <td className="px-6 py-4.5 font-bold text-white whitespace-nowrap">
                      {client.name}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5 whitespace-nowrap">
                        {client.companyName}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-slate-300">
                      {client.email}
                      <span className="block text-[10px] text-slate-500 mt-0.5 font-semibold">
                        {client.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-slate-400">
                      {client.industry}
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {client.businessType}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                        client.status === 'Converted' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        client.status === 'Failed' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        client.status === 'Work In Progress' ? 'bg-sky-500/10 border-sky-500/20 text-sky-450' :
                        client.status === 'Proposal Sent' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        'bg-slate-800/40 border-slate-750 text-slate-400'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`text-[10px] font-bold ${
                        client.priority === 'High' ? 'text-rose-400' :
                        client.priority === 'Medium' ? 'text-amber-500' :
                        'text-slate-400'
                      }`}>
                        {client.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-bold font-mono text-slate-200">
                      ${client.budget.toLocaleString()}
                    </td>
                    <td className="px-6 py-4.5 text-slate-400 font-medium">
                      {client.assignedTo}
                    </td>
                    <td className="px-6 py-4.5 text-right font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent opening detailed card
                          onDeleteClient(client.id);
                        }}
                        className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete client record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-550">
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-950/15 max-w-xs mx-auto rounded-2xl border border-slate-800/50">
                      <FolderOpen className="w-8 h-8 text-slate-650 mb-3" />
                      <span className="text-xs font-bold text-slate-400">No client records found</span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Try modifying search syntax or create a new lead portfolio!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
