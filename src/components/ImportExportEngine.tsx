import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  AlertTriangle, 
  Sliders, 
  ChevronRight, 
  Info, 
  Download,
  Terminal,
  Grid
} from 'lucide-react';
import { Client } from '../types.js';

interface ImportExportEngineProps {
  showImport: boolean;
  onCloseImport: () => void;
  onImportSuccess: (count: number) => void;
  onExportFinish: (format: 'csv' | 'json', clientsToExport: Client[]) => void;
}

export default function ImportExportEngine({
  showImport,
  onCloseImport,
  onImportSuccess,
  onExportFinish
}: ImportExportEngineProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<{ [dbKey: string]: string }>({
    name: 'Client Name',
    companyName: 'Company Name',
    email: 'Email',
    phone: 'Phone Number',
    status: 'Status',
    budget: 'Budget'
  });
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!showImport) return null;

  const processText = (text: string) => {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        setErrorLogs(['Spreadsheet contains insufficient lines to map attributes.']);
        return;
      }

      // Very robust CSV line splitter addressing quoted cells
      const parseCSVLine = (line: string) => {
        const result = [];
        let curCell = '';
        let insideQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            result.push(curCell.trim());
            curCell = '';
          } else {
            curCell += char;
          }
        }
        result.push(curCell.trim());
        return result;
      };

      const headerLine = lines[0];
      const headerCols = parseCSVLine(headerLine);
      setColumns(headerCols);

      const parsedRows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const rowCells = parseCSVLine(lines[i]);
        const rowObj: any = {};
        headerCols.forEach((col, cIdx) => {
          rowObj[col] = rowCells[cIdx] || '';
        });
        parsedRows.push(rowObj);
      }

      setParsedData(parsedRows);
      setErrorLogs([]);
    } catch (err: any) {
      setErrorLogs([`Parser error execution failure: ${err.message}`]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processText(text);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (parsedData.length === 0) return;
    setIsProcessing(true);

    try {
      // Map columns based on configuration
      const finalImportList = parsedData.map(row => ({
        name: row[mappings.name] || '',
        companyName: row[mappings.companyName] || '',
        email: row[mappings.email] || '',
        phone: row[mappings.phone] || '',
        status: row[mappings.status] || 'New Lead',
        budget: Number(row[mappings.budget]) || 0
      }));

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients: finalImportList })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Import failed.');

      onImportSuccess(data.addedCount);
    } catch (err: any) {
      setErrorLogs([`Server Import execution failure: ${err.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dynamic backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer" onClick={onCloseImport} />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-2xl relative z-10 font-sans text-white text-xs space-y-6">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Grid className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Excel client importing deck</h2>
          </div>
          <button 
            onClick={onCloseImport} 
            className="p-1 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorLogs.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-1">
            <span className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4.5 h-4.5" /> Validation warnings detected:</span>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-[11px] font-mono">
              {errorLogs.map((log, lIdx) => <li key={lIdx}>{log}</li>)}
            </ul>
          </div>
        )}

        {/* 1. UPLOADING ZONE */}
        {parsedData.length === 0 ? (
          <div className="space-y-4">
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { 
                e.preventDefault(); 
                setDragActive(false); 
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const r = new FileReader();
                  r.onload = ev => processText(ev.target?.result as string);
                  r.readAsText(file);
                }
              }}
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors flex flex-col items-center justify-center space-y-4 ${
                dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-950/20'
              }`}
            >
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg animate-pulse-slow">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-300 block">Drag spreadsheet files here, or browse files</span>
                <p className="text-[10px] text-slate-500 mt-1">Accepts standard `.csv`, comma-split text exports, or Excel Sheets output.</p>
              </div>

              <input 
                type="file" 
                id="csv_browse_field" 
                accept=".csv, .txt" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <label 
                htmlFor="csv_browse_field" 
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-700/80 cursor-pointer font-semibold text-xs text-slate-300 active:translate-y-px transition-colors block"
              >
                Browse directory file
              </label>
            </div>
          </div>
        ) : (
          /* 2. MAPPING CONFIG AND ROW PREVIEWS ZONE */
          <div className="space-y-4">
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Configure attributes mapping</h3>
            
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 border border-slate-850 rounded-2xl">
              {Object.keys(mappings).map((dbKey) => (
                <div key={dbKey} className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 font-semibold font-mono uppercase tracking-wide text-[9px]">
                    Database: {dbKey}
                  </span>
                  <select
                    value={mappings[dbKey]}
                    onChange={(e) => setMappings({ ...mappings, [dbKey]: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 select-none text-[10px] outline-none text-slate-300 min-w-32"
                  >
                    <option value="">-- Skip Column --</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview loaded items */}
            <h3 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] pt-2">Data preview ({parsedData.length} entries parsed)</h3>
            <div className="max-h-48 overflow-y-auto border border-slate-850 rounded-2xl">
              <table className="w-full text-left border-collapse bg-slate-950/20 text-[10px]">
                <thead>
                  <tr className="border-b border-slate-850 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/50">
                    <th className="px-3 py-2">Parsed contact name</th>
                    <th className="px-3 py-2">Corporation</th>
                    <th className="px-3 py-2">Primary email</th>
                    <th className="px-3 py-2">Assigned status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-slate-400 font-mono">
                  {parsedData.slice(0, 4).map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="px-3 py-2 font-sans font-bold text-white">{row[mappings.name] || 'N/A'}</td>
                      <td className="px-3 py-2">{row[mappings.companyName] || 'N/A'}</td>
                      <td className="px-3 py-2 text-indigo-400">{row[mappings.email] || 'N/A'}</td>
                      <td className="px-3 py-2">
                        <span className="bg-slate-850 px-1.5 py-0.5 rounded text-[9px] text-slate-350">{row[mappings.status] || 'New Lead'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <button 
                onClick={() => { setParsedData([]); setColumns([]); }} 
                className="text-xs font-semibold text-rose-450 hover:text-rose-450 cursor-pointer"
              >
                Clear mapping sheet
              </button>
              <button
                onClick={handleCommitImport}
                disabled={isProcessing}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                {isProcessing ? 'Importing pipeline...' : 'Commit Database Import'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
