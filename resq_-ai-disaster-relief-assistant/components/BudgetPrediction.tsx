
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  TrendingUp, 
  Calculator, 
  Info, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Database,
  ArrowRight,
  HelpCircle,
  PlayCircle,
  Zap,
  Cpu,
  FileText,
  PieChart as PieChartIcon,
  BarChart4,
  CheckCircle2,
  Heart,
  MessageSquare,
  ArrowUpRight,
  Target,
  FileDown,
  Layers,
  ShieldAlert,
  ChevronDown,
  Trash2,
  FileCheck,
  RotateCcw,
  ListFilter,
  Activity,
  Filter
} from 'lucide-react';
import { HistoricalDisaster, BudgetPrediction as PredictionResult } from '../types';
import { predictDisasterBudget } from '../services/geminiService';
import BudgetChat from './BudgetChat';

const DEMO_DATA: HistoricalDisaster[] = [
  { 
    type: 'Flood', severity: 'High', durationDays: 14, year: 2021, area: 'Odisha Coastal', populationImpacted: 500000,
    foodBudget: 40000000, waterBudget: 20000000, shelterBudget: 150000000, rescueBudget: 80000000, 
    medicalBudget: 60000000, logisticsBudget: 45000000, commBudget: 12000000, rehabBudget: 300000000, 
    totalBudget: 707000000 
  },
  { 
    type: 'Cyclone', severity: 'Critical', durationDays: 10, year: 2022, area: 'West Bengal Delta', populationImpacted: 1200000,
    foodBudget: 95000000, waterBudget: 50000000, shelterBudget: 400000000, rescueBudget: 200000000, 
    medicalBudget: 150000000, logisticsBudget: 120000000, commBudget: 40000000, rehabBudget: 800000000, 
    totalBudget: 1855000000 
  }
];

const sanitizeString = (val: string): string => val?.trim() || "Unknown";
const parseNumeric = (val: string): number => {
  const num = parseFloat(val?.replace(/[^0-9.-]+/g, "") || "0");
  return isNaN(num) ? 0 : num;
};
const standardizeSeverity = (val: string): any => {
  const s = val?.trim().toLowerCase();
  if (s?.includes('crit')) return 'Critical';
  if (s?.includes('high')) return 'High';
  if (s?.includes('med')) return 'Medium';
  return 'Low';
};

const AllocationDonut: React.FC<{ data: { label: string, value: number, color: string }[], t: any }> = ({ data, t }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(128,128,128,0.1)" strokeWidth="10" />
        {data.map((item, i) => {
          const percent = (item.value / (total || 1)) * 100;
          const dashArray = `${percent} ${100 - percent}`;
          const dashOffset = -cumulativePercent;
          cumulativePercent += percent;
          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={item.color}
              strokeWidth="10"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out cursor-pointer hover:stroke-[12px]"
              pathLength="100"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">{t.budget.mlReasoning}</p>
        <p className="text-lg font-black text-[var(--text-main)] leading-none uppercase">{t.budget.categoryDist}</p>
      </div>
    </div>
  );
};

const FiscalVarianceBar: React.FC<{ predicted: number, historicalAvg: number }> = ({ predicted, historicalAvg }) => {
  const diff = predicted - (historicalAvg || 1);
  const isHigher = diff > 0;
  const percent = Math.abs((diff / (historicalAvg || 1)) * 100).toFixed(1);

  return (
    <div className="p-5 glass-panel border-none bg-indigo-500/10 flex items-center gap-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isHigher ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
        {isHigher ? <ArrowUpRight className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Historic Variance</p>
        <p className="text-lg font-black">
          {isHigher ? '+' : '-'}{percent}% <span className="text-xs text-[var(--text-muted)] font-bold uppercase ml-2">vs. Baseline</span>
        </p>
      </div>
    </div>
  );
};

interface BudgetPredictionProps {
  initialArea?: string;
  initialType?: string;
  language: string;
  t: any;
}

const BudgetPrediction: React.FC<BudgetPredictionProps> = ({ initialArea, initialType, language, t }) => {
  const [data, setData] = useState<HistoricalDisaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [view, setView] = useState<'dashboard' | 'advisor' | 'batch'>('dashboard');
  const [scenario, setScenario] = useState({
    type: initialType || 'Flood',
    severity: 'High',
    population: 750000,
    duration: 15,
    area: initialArea || 'Regional Zone'
  });
  
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const historicalAverage = useMemo(() => {
    if (data.length === 0) return 0;
    return data.reduce((acc, curr) => acc + curr.totalBudget, 0) / data.length;
  }, [data]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCleaning(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        try {
          const text = event.target?.result as string;
          const rows = text.split('\n').map(r => r.trim()).filter(row => row !== '');
          if (rows.length < 2) throw new Error("Dataset too small.");

          const parsedData = rows.slice(1).map((row) => {
            const v = row.split(',').map(sanitizeString);
            if (v.length < 15) return null;
            return {
              type: v[0], 
              severity: standardizeSeverity(v[1]), 
              durationDays: parseNumeric(v[2]), 
              year: parseNumeric(v[3]), 
              area: v[4], 
              populationImpacted: parseNumeric(v[5]),
              foodBudget: parseNumeric(v[6]), 
              waterBudget: parseNumeric(v[7]), 
              shelterBudget: parseNumeric(v[8]), 
              rescueBudget: parseNumeric(v[9]),
              medicalBudget: parseNumeric(v[10]), 
              logisticsBudget: parseNumeric(v[11]), 
              commBudget: parseNumeric(v[12]), 
              rehabBudget: parseNumeric(v[13]),
              totalBudget: parseNumeric(v[14]) || 0
            };
          }).filter(x => x !== null) as HistoricalDisaster[];

          setCleaning(false);
          setTraining(true);
          setTrainingProgress(0);
          const interval = setInterval(() => {
            setTrainingProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                setTraining(false);
                setData(parsedData);
                return 100;
              }
              return prev + 10;
            });
          }, 100);
        } catch (err: any) {
          setCleaning(false);
          setError(err.message || "Failed to process CSV.");
        }
      }, 500);
    };
    reader.readAsText(file);
  };

  const handlePredict = async () => {
    if (!data.length) {
      setError(t.common.error);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await predictDisasterBudget(
        data, scenario.type, scenario.population, scenario.area, scenario.severity, scenario.duration, language
      );
      setPrediction(result);
      setView('dashboard');
    } catch (err) {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const formatToCrore = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;

  const chartData = useMemo(() => {
    if (!prediction) return [];
    return [
      { label: t.budget.food, value: prediction.breakdown.food, color: 'rgb(var(--rgb-cyan))' },
      { label: t.budget.water, value: prediction.breakdown.water, color: 'rgb(var(--rgb-indigo))' },
      { label: t.budget.shelter, value: prediction.breakdown.shelter, color: 'rgb(var(--rgb-violet))' },
      { label: t.budget.rescue, value: prediction.breakdown.rescue, color: 'rgb(var(--rgb-rose))' },
      { label: t.budget.medical, value: prediction.breakdown.medical, color: 'rgb(var(--rgb-emerald))' },
      { label: t.budget.logistics, value: prediction.breakdown.logistics, color: 'rgba(var(--rgb-indigo), 0.6)' },
      { label: t.budget.comm, value: prediction.breakdown.comm, color: 'rgba(var(--rgb-cyan), 0.6)' },
      { label: t.budget.rehab, value: prediction.breakdown.rehab, color: 'rgba(var(--rgb-violet), 0.6)' },
    ];
  }, [prediction, t]);

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Database className="w-4 h-4" /> {t.budget.trainingNode}
            </h3>

            {error && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-rose-400 uppercase">{error}</p>
              </div>
            )}

            {cleaning ? (
              <div className="py-10 text-center animate-pulse">
                <Filter className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
                <p className="text-[10px] font-black text-indigo-400 uppercase">{t.budget.sanitizing}</p>
              </div>
            ) : training ? (
              <div className="py-10 text-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-4">{t.budget.training}</p>
                <div className="h-1.5 w-full bg-[var(--input-bg)] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all" style={{ width: `${trainingProgress}%` }}></div>
                </div>
              </div>
            ) : !data.length ? (
              <div className="space-y-4">
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[var(--border-panel)] rounded-3xl p-10 text-center cursor-pointer hover:bg-indigo-500/5 transition-all group">
                  <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4 group-hover:text-indigo-400 transition-all" />
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t.budget.trainingNode}</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                </div>
                <button onClick={() => setData(DEMO_DATA)} className="w-full btn-action bg-indigo-500/10 border border-indigo-500/30 py-4 text-indigo-400 text-[10px] flex items-center justify-center gap-3">
                  <PlayCircle className="w-4 h-4" /> Tactical Demo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <p className="text-[10px] font-black text-emerald-400 uppercase">{data.length} Records</p>
                  </div>
                  <button onClick={() => { setData([]); setPrediction(null); }} className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel p-8">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-8 uppercase">{t.budget.manualParams}</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <select value={scenario.type} onChange={(e) => setScenario(p => ({...p, type: e.target.value}))} className="bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-[10px] font-black rounded-xl outline-none focus:border-indigo-500 text-[var(--text-main)]">
                  <option>Flood</option><option>Cyclone</option><option>Earthquake</option>
                </select>
                <select value={scenario.severity} onChange={(e) => setScenario(p => ({...p, severity: e.target.value}))} className="bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-[10px] font-black rounded-xl outline-none focus:border-indigo-500 text-[var(--text-main)]">
                  <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                </select>
              </div>
              <input type="number" placeholder="Population" value={scenario.population} onChange={(e) => setScenario(p => ({...p, population: parseInt(e.target.value) || 0}))} className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-[10px] font-black rounded-xl text-[var(--text-main)]" />
              <button onClick={handlePredict} disabled={!data.length || loading || training} className="w-full btn-action bg-gradient-to-r from-indigo-600 to-violet-600 py-5 font-black text-[11px] text-white disabled:opacity-30 shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                {t.budget.runInference}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {!prediction ? (
            <div className="glass-panel p-20 text-center h-full border-dashed border-2 flex flex-col items-center justify-center bg-transparent">
              <RotateCcw className="w-16 h-16 text-[var(--text-muted)] mb-8 opacity-10 animate-pulse" />
              <h4 className="text-xl font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">{t.common.loading}</h4>
              <p className="text-sm text-[var(--text-muted)] mt-6 font-medium uppercase tracking-widest">Awaiting calibration data ingestion.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-12 duration-700">
              <div className="glass-panel bg-[var(--bg-app)] p-12 relative overflow-hidden border-indigo-500/30">
                <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2">{t.budget.totalFiscal}</p>
                <h2 className="text-8xl font-black tracking-tighter leading-none mb-6">{formatToCrore(prediction.predictedTotal)}</h2>
                <FiscalVarianceBar predicted={prediction.predictedTotal} historicalAvg={historicalAverage} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-10 flex flex-col items-center bg-[var(--input-bg)]">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 self-start text-indigo-400">{t.budget.categoryDist}</h4>
                   <AllocationDonut data={chartData} t={t} />
                </div>
                <div className="glass-panel p-10 bg-[var(--input-bg)]">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 text-indigo-400">{t.budget.mlReasoning}</h4>
                   <div className="p-5 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-panel)] max-h-60 overflow-y-auto custom-scrollbar">
                      <p className="text-xs font-medium text-[var(--text-main)] italic leading-relaxed whitespace-pre-wrap">"{prediction.reasoning}"</p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetPrediction;
