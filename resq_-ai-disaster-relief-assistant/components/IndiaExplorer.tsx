
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Globe, 
  Cloud, 
  Hospital, 
  Shield, 
  Landmark, 
  AlertCircle, 
  Loader2, 
  TrendingUp,
  Map as MapIcon,
  Navigation,
  Database,
  ArrowRight,
  Calculator,
  Zap,
  Activity
} from 'lucide-react';
import { getIndiaLocationDetails, IndiaLocationData } from '../services/geminiService';
import TacticalWeather from './TacticalWeather';

interface IndiaExplorerProps {
  onDeploy?: (location: string) => void;
  onFindServices?: (location: string, type: string) => void;
  onAuditBudget?: (area: string, type: string) => void;
  language: string;
  t: any;
}

const IndiaExplorer: React.FC<IndiaExplorerProps> = ({ onDeploy, onFindServices, onAuditBudget, language, t }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IndiaLocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const SUGGESTIONS = language === 'hi' 
    ? ["मुंबई", "भुवनेश्वर", "जोशीमठ", "गुवाहाटी", "चेन्नई"] 
    : ["Mumbai", "Bhubaneswar", "Joshimath", "Guwahati", "Chennai"];

  const handleSearch = async (e: React.FormEvent | string) => {
    const searchTerm = typeof e === 'string' ? e : query;
    if (typeof e !== 'string') e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await getIndiaLocationDetails(searchTerm, language);
      setData(result);
      if (typeof e === 'string') setQuery(e);
    } catch (err) {
      setError(language === 'hi' ? "स्थान खोज विफल रही।" : "Location query failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="glass-panel p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em]">{language === 'hi' ? 'सैटेलाइट इंटेलिजेंस नोड' : 'Satellite Intelligence Node'}</h2>
        </div>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex gap-3 mb-8">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === 'hi' ? "शहर, जिला या तालुका खोजें..." : "Query city, district or taluka..."}
              className="w-full pl-12 pr-6 py-4 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-2xl text-sm focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 text-[var(--text-main)]"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-action bg-indigo-600 px-10 py-4 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'hi' ? 'निष्पादित करें' : 'EXECUTE')}
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-xl text-[10px] font-black text-[var(--text-muted)] hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all uppercase tracking-widest"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">{t.common.loading}</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 text-[var(--text-main)]">
          <div className="lg:col-span-12 space-y-10">
            {/* Real-time Tactical Weather Report */}
            <div className="space-y-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">{language === 'hi' ? 'लाइव मौसम इंटेलिजेंस' : 'Live Weather Intelligence'}</h3>
               </div>
               <TacticalWeather data={data.weather} language={language} />
            </div>

            <div className="glass-panel p-10 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                  <div>
                    <h3 className="text-6xl font-black tracking-tighter leading-tight">{data.name}</h3>
                    <p className="text-lg font-bold text-[var(--text-muted)] mt-2 uppercase tracking-wide">{data.district}, {data.state}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => onDeploy?.(data.name)}
                      className="btn-action bg-rose-600 px-8 py-4 text-xs text-white flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" /> {t.common.deploy}
                    </button>
                    <button 
                      onClick={() => onFindServices?.(data.name, 'Hospital')}
                      className="btn-action bg-indigo-600 px-8 py-4 text-xs text-white flex items-center justify-center gap-2"
                    >
                      <Activity className="w-4 h-4" /> {language === 'hi' ? 'सुविधाएं खोजें' : 'Locate Infrastructure'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-[var(--border-panel)]">
                  <div>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">PIN</p>
                    <p className="text-lg font-black">{data.pinCode || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{language === 'hi' ? 'जनसंख्या' : 'POPULATION'}</p>
                    <p className="text-lg font-black">{data.population || '---'}</p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4">{language === 'hi' ? 'प्रसिद्ध स्थान' : 'Landmarks'}</h4>
                    <div className="flex flex-wrap gap-2">
                       {data.famousPlaces.map((place, i) => (
                         <span key={i} className="px-3 py-1 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-lg text-[10px] font-bold text-slate-400 uppercase">{place}</span>
                       ))}
                    </div>
                  </div>
                  {data.sources && data.sources.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4">{language === 'hi' ? 'इंटेलिजेंस स्रोत' : 'Intel Sources'}</h4>
                      <div className="space-y-2">
                         {data.sources.slice(0, 3).map((s, i) => (
                           <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="block text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors truncate">
                             • {s.title}
                           </a>
                         ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-40 text-center glass-panel border-dashed border-2 border-[var(--border-panel)] bg-transparent flex flex-col items-center justify-center text-[var(--text-muted)]">
          <Globe className="w-20 h-20 mb-6 opacity-20" />
          <h4 className="text-lg font-black uppercase tracking-[0.4em]">{language === 'hi' ? 'नोड स्कैन आरंभ करें' : 'Initialize Node Scan'}</h4>
        </div>
      )}
    </div>
  );
};

export default IndiaExplorer;
