import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  Funnel,
  FunnelChart
} from 'recharts';
import { 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  Users, 
  ChevronRight,
  TrendingDown,
  Percent
} from 'lucide-react';

interface AnalyticsChartsProps {
  stats: any;
  theme: 'dark' | 'light';
}

export default function AnalyticsCharts({ stats, theme }: AnalyticsChartsProps) {
  const [chartData, setChartData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard/charts');
      const data = await response.json();
      setChartData(data);
    } catch (err) {
      console.error('Failed to query CRM charting assets.', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [stats]);

  if (isLoading || !chartData) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wider uppercase font-sans text-slate-500">Compiling analytical charts...</span>
      </div>
    );
  }

  // Color coordinate palettes
  const CHART_COLORS = {
    indigo: '#6366f1',
    emerald: '#10b981',
    sky: '#0ba5e9',
    amber: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    slate: '#64748b',
    teal: '#14b8a6',
    pink: '#ec4899'
  };

  const STATUS_PIE_COLORS = [
    CHART_COLORS.indigo, 
    CHART_COLORS.sky, 
    CHART_COLORS.violet, 
    CHART_COLORS.amber, 
    CHART_COLORS.teal, 
    CHART_COLORS.pink,
    CHART_COLORS.emerald, 
    CHART_COLORS.rose,
    CHART_COLORS.slate
  ];

  return (
    <div className="space-y-8 animate-fade-in text-white font-sans">
      
      {/* Analytics Module title */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-white flex items-center gap-2">
          CRM Analytics Board <Sparkles className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Complete graphical breakdown of lead-funnel ratios, revenue pipelines, staff metrics, and acquisition timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Monthly Revenue Generated Area Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl col-span-1 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Closed Revenue Progression</h3>
              <p className="text-[10px] text-slate-400 mt-1">Monthly total value of concluded converted sales contracts.</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
              Financial ledger
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v/1000)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue Generated']}
                />
                <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.emerald} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Lead Status Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl col-span-1 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Distribution</h3>
            <p className="text-[10px] text-slate-400 mt-1">Lead ratios sorted by current active pipeline stages.</p>
          </div>

          <div className="h-60 w-full relative flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.statusChartData.filter((d: any) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.statusChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={STATUS_PIE_COLORS[index % STATUS_PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Pie Center Label */}
            <div className="absolute text-center mt-3 scale-90">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest block">Total Pipeline</span>
              <span className="text-2xl font-extrabold text-white leading-none font-sans mt-0.5">
                {chartData.statusChartData.reduce((s: number, entry: any) => s + entry.value, 0)}
              </span>
            </div>
          </div>

          {/* Miniature inline legend for statuses */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/60 max-h-24 overflow-y-auto">
            {chartData.statusChartData.filter((d: any) => d.value > 0).map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
                <span 
                  className="h-2 w-2 rounded-full inline-block shrink-0" 
                  style={{ backgroundColor: STATUS_PIE_COLORS[index % STATUS_PIE_COLORS.length] }} 
                />
                <span className="text-[9px] font-bold text-slate-400 truncate uppercase leading-normal" title={entry.name}>
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Conversion Funnel Horizontal Progression List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl col-span-1 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Conversion Funnel Stages</h3>
            <p className="text-[10px] text-slate-400 mt-1">Ratio progression path from newly registered leads to closed won deals.</p>
          </div>

          <div className="space-y-3.5 pt-3">
            {chartData.funnelData.map((step: any, index: number) => {
              const maxLeads = chartData.funnelData[0]?.count || 1;
              const ratio = maxLeads > 0 ? Math.round((step.count / maxLeads) * 100) : 0;
              return (
                <div key={step.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-350">{step.name}</span>
                    <span className="text-indigo-400 font-mono font-bold">{step.count} leads <span className="text-slate-550 font-normal text-[10px] ml-1">({ratio}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-lg border border-slate-850 overflow-hidden relative">
                    <div 
                      className="bg-indigo-600 h-2 rounded-lg transition-all duration-500" 
                      style={{ width: `${ratio}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Monthly Client Acquisition Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl col-span-1 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pipeline Acquisition Rate</h3>
            <p className="text-[10px] text-slate-400 mt-1">Number of newly registered clients per month.</p>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthlyAcquisitionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="clients" fill={CHART_COLORS.sky} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Lead Source Conversions comparison chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl col-span-1 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Conversions by Marketing Source</h3>
            <p className="text-[10px] text-slate-400 mt-1">Compares total sourced leads to converted accounts.</p>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.leadSourceData.filter((d: any) => d.leads > 0)} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="source" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '11px' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', pt: 10 }} />
                <Bar dataKey="leads" name="Sourced" fill={CHART_COLORS.slate} radius={[2, 2, 0, 0]} />
                <Bar dataKey="conversions" name="Converted" fill={CHART_COLORS.violet} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Employee Comparison Dashboard Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl col-span-1 lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Executive Performance Matrices</h3>
              <p className="text-[10px] text-slate-400 mt-1">Cross comparison of leads handled, won accounts, and generated contract balances.</p>
            </div>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
              Sales Staff comparison
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {chartData.employeePerformance.map((emp: any) => {
              const conversionRatio = emp.leadsHandled > 0 ? Math.round((emp.conversions / emp.leadsHandled) * 100) : 0;
              return (
                <div key={emp.employee} className="bg-slate-950 p-5 rounded-2xl border border-slate-850/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                      {emp.employee.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white tracking-wide uppercase">{emp.employee}</h4>
                      <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Pipeline Portfolio Owner</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 text-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Portfolio Leads</span>
                      <span className="text-sm font-mono font-extrabold text-white leading-none inline-block mt-1">{emp.leadsHandled}</span>
                    </div>
                    
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 text-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Deals WON</span>
                      <span className="text-sm font-mono font-extrabold text-emerald-400 leading-none inline-block mt-1">{emp.conversions}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 text-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Won Revenue</span>
                      <span className="text-sm font-mono font-extrabold text-indigo-400 leading-none inline-block mt-1">${emp.revenue.toLocaleString()}</span>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 text-center">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Won Ratio</span>
                      <span className="text-sm font-mono font-extrabold text-violet-400 leading-none inline-block mt-1">{conversionRatio}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
