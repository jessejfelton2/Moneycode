'use client';

import React, { useState } from 'react';

// Mock Data for Initial Prototype State
const INITIAL_QUEUE = [
  { id: 1, date: '2026-07-02', merchant: 'Chevron Auto', amount: 45.50, initialCat: 'Gas & Fuel' },
  { id: 2, date: '2026-07-01', merchant: 'Publix Supermarkets', amount: 132.18, initialCat: 'Groceries' },
  { id: 3, date: '2026-06-30', merchant: 'Adobe Systems Inc', amount: 54.99, initialCat: 'Software' },
];

const INTERNAL_TRANSFERS = [
  { id: 't1', date: '2026-07-01', source: 'Checking Account', destination: 'High-Yield Savings', amount: 1500.00, type: 'Outflow' },
  { id: 't2', date: '2026-07-01', source: 'Checking Account', destination: 'High-Yield Savings', amount: 1500.00, type: 'Inflow' },
  { id: 't3', date: '2026-06-28', source: 'Checking Account', destination: 'Premium Credit Card', amount: 425.30, type: 'Outflow' },
  { id: 't4', date: '2026-06-28', source: 'Checking Account', destination: 'Premium Credit Card', amount: 425.30, type: 'Inflow' },
];

export default function MoneycodeDashboard() {
  // Tier State: false = Free (Manual/CSV), true = Premium ($7/mo Live Sync)
  const [isPremium, setIsPremium] = useState(false);
  
  // Two-Tap Review States
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedTx, setSelectedTx] = useState<number | null>(null);
  const [stagedCategory, setStagedCategory] = useState<string | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Manual File Upload State Mock
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleStageTap = (id: number, cat: string) => {
    setSelectedTx(id);
    setStagedCategory(cat);
  };

  const handleConfirmTap = (id: number) => {
    setQueue(queue.filter(item => item.id !== id));
    setSelectedTx(null);
    setStagedCategory(null);
    setReviewedCount(prev => prev + 1);
  };

  const simulateCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadStatus('Parsing transactions...');
      setTimeout(() => {
        setUploadStatus('Successfully parsed 14 transactions into queue.');
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans p-6 md:p-12">
      {/* Top Header & Architectural Frame */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-800 pb-8 mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            MONEY<span className="text-[#00F5D4]">CODE</span>
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mt-1">
            High-Contrast Financial Control Engine
          </p>
        </div>

        {/* Freemium Infrastructure Toggle */}
        <div className="bg-slate-900 p-1.5 border border-slate-700 flex items-center gap-2 rounded-none">
          <button 
            onClick={() => setIsPremium(false)}
            className={`px-4 py-2 text-xs font-bold font-mono tracking-wider transition-all uppercase rounded-none ${!isPremium ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Free Tier (Manual/CSV)
          </button>
          <button 
            onClick={() => setIsPremium(true)}
            className={`px-4 py-2 text-xs font-bold font-mono tracking-wider transition-all uppercase rounded-none ${isPremium ? 'bg-[#00F5D4] text-slate-950 shadow-[0_0_15px_rgba(0,245,212,0.4)]' : 'text-slate-400 hover:text-white'}`}
          >
            Premium ($7/Mo Sync)
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Operations & Queues */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Module 1: Data Ingestion Sandbox */}
          <section className="bg-slate-900 border-l-4 border-[#00F5D4] p-6 shadow-xl">
            <h2 className="text-xl font-extrabold tracking-tight text-white mb-2 uppercase">
              Data Ingestion Layer
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Current Mode: {isPremium ? 'Automated banking channels active.' : 'Direct local data import constraints applied.'}
            </p>

            {!isPremium ? (
              <div className="border-2 border-dashed border-slate-700 p-6 text-center hover:border-slate-500 transition-colors bg-slate-950">
                <input 
                  type="file" 
                  accept=".csv" 
                  id="csv-upload" 
                  className="hidden" 
                  onChange={simulateCsvUpload}
                />
                <label htmlFor="csv-upload" className="cursor-pointer block">
                  <span className="bg-white text-slate-950 px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-all inline-block mb-2">
                    Select Statement CSV
                  </span>
                  <p className="text-xs text-slate-500 font-mono">Supports standard banking formats natively</p>
                </label>
                {uploadStatus && (
                  <p className="mt-3 text-xs font-mono text-[#00F5D4]">{uploadStatus}</p>
                )}
              </div>
            ) : (
              <div className="bg-slate-950 border border-teal-500/30 p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse" />
                    <p className="text-sm font-bold font-mono text-white">PLAID ENGINE: CONNECTED</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Live background ledger syncing every 6 hours</p>
                </div>
                <span className="text-xs font-mono bg-teal-950 text-[#00F5D4] border border-teal-800 px-3 py-1">
                  Premium Pass
                </span>
              </div>
            )}
          </section>

          {/* Module 2: Two-Tap Review Queue */}
          <section className="bg-slate-900 p-6 border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase">Two-Tap Review Queue</h3>
                <p className="text-xs text-slate-400 mt-0.5">Verify accuracy before final ledger integration</p>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 text-slate-300 font-bold">
                {queue.length} Pending
              </span>
            </div>

            {queue.length === 0 ? (
              <div className="bg-slate-950 p-8 text-center border border-slate-800">
                <p className="text-sm text-slate-400 font-mono">✓ System clear. All transactions compiled cleanly.</p>
                {reviewedCount > 0 && (
                  <p className="text-xs text-[#00F5D4] mt-1 font-mono">+{reviewedCount} transactions processed this session.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((tx) => {
                  const isStaged = selectedTx === tx.id;
                  return (
                    <div 
                      key={tx.id} 
                      className={`transition-all border ${isStaged ? 'border-[#00F5D4] bg-slate-950' : 'border-slate-800 bg-slate-950/60'} p-4`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block">{tx.date}</span>
                          <span className="text-sm font-bold text-white tracking-tight">{tx.merchant}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black font-mono text-white">${tx.amount.toFixed(2)}</span>
                          <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                            Staged: <span className="underline decoration-slate-600">{stagedCategory && isStaged ? stagedCategory : tx.initialCat}</span>
                          </span>
                        </div>
                      </div>

                      {/* Tap Action Row Architecture */}
                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex gap-1">
                          {['Groceries', 'Gas & Fuel', 'Dining Out', 'Software'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => handleStageTap(tx.id, cat)}
                              className={`px-2.5 py-1 text-[10px] font-bold font-mono transition-all border ${
                                isStaged && stagedCategory === cat 
                                  ? 'bg-[#00F5D4] text-slate-950 border-[#00F5D4]' 
                                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Direct Stage Confirmation Trigger */}
                        <button
                          disabled={!isStaged}
                          onClick={() => handleConfirmTap(tx.id)}
                          className={`px-4 py-1.5 text-xs font-black tracking-wider uppercase transition-all ${
                            isStaged 
                              ? 'bg-white text-slate-950 hover:bg-slate-200 cursor-pointer' 
                              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Calculations & Transfer Architecture */}
        <div className="space-y-8">
          
          {/* Module 3: Metrics Board */}
          <section className="bg-slate-900 p-6 border border-slate-800">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4">
              Consolidated Net Metrics
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 border border-slate-800">
                <span className="text-xs text-slate-500 font-mono block">Primary Operating Outflows</span>
                <span className="text-3xl font-black text-white font-mono mt-1 block">$232.67</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">Excludes self-directed balancing actions</span>
              </div>
            </div>
          </section>

          {/* Module 4: Internal Transfers Isolation Vault */}
          <section className="bg-slate-900 p-6 border-t-4 border-slate-400">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white uppercase">Internal Transfers</h3>
                <span className="bg-slate-800 border border-slate-700 text-[9px] font-mono text-slate-400 px-1.5 py-0.5 uppercase tracking-wider">
                  Isolated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Matching pairs are cross-referenced and removed from operating expense reports automatically.
              </p>
            </div>

            <div className="space-y-2">
              {INTERNAL_TRANSFERS.map((transfer) => (
                <div key={transfer.id} className="bg-slate-950 p-3 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 ${transfer.type === 'Inflow' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className="font-bold text-slate-300">{transfer.source}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">→ {transfer.destination}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`font-bold ${transfer.type === 'Inflow' ? 'text-slate-300' : 'text-slate-400'}`}>
                      {transfer.type === 'Inflow' ? '+' : '-'}${transfer.amount.toFixed(2)}
                    </span>
                    <span className="block text-[9px] font-mono text-slate-600 uppercase tracking-tight mt-0.5">Net Zero Match</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-slate-950/40 border border-dashed border-slate-800 text-center">
              <p className="text-[10px] font-mono text-slate-400">
                Total System Offset Impact: <span className="text-white font-bold">$1,925.30</span> (0.00 Net Friction)
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
