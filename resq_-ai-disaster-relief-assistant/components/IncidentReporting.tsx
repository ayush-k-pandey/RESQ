
import React, { useState, useRef } from 'react';
import { 
  Camera, 
  ShieldAlert, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  X, 
  Activity,
  Upload,
  Eye,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { analyzeIncidentImage, IncidentAnalysis } from '../services/geminiService';

interface IncidentReportingProps {
  language: string;
  t: any;
}

const IncidentReporting: React.FC<IncidentReportingProps> = ({ language, t }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processIncident = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const mimeType = image.split(';')[0].split(':')[1];
      const result = await analyzeIncidentImage(image, mimeType, language);
      setAnalysis(result);
    } catch (err) {
      setError(language === 'hi' ? "एआई विजन नोड छवि की व्याख्या करने में विफल रहा।" : "AI Vision Node failed to interpret the image.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-8">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Camera className="w-4 h-4" /> {t.reports.telemetry}
            </h3>
            
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-[var(--border-panel)] rounded-3xl p-12 text-center cursor-pointer hover:bg-indigo-500/5 transition-all"
              >
                <Upload className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 group-hover:text-indigo-400 transition-colors" />
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  {t.reports.dropPhoto}
                </p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden border border-[var(--border-panel)] aspect-video bg-black">
                  <img src={image} alt="Incident Preview" className="w-full h-full object-contain" />
                  <button 
                    onClick={reset}
                    className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-tight">{error}</p>
                  </div>
                )}

                <button 
                  onClick={processIncident}
                  disabled={loading}
                  className="w-full btn-action bg-indigo-600 py-4 text-white font-black text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                  {t.reports.executeAudit}
                </button>
              </div>
            )}
          </div>

          <div className="glass-panel p-6 bg-amber-500/5 border-amber-500/20">
             <div className="flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                   <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{t.reports.protocol}</h4>
                   <p className="text-[10px] font-bold text-amber-600/80 leading-relaxed uppercase">
                     Prioritize personal safety before capturing telemetry.
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {!analysis && !loading ? (
            <div className="h-full glass-panel border-dashed border-2 flex flex-col items-center justify-center p-20 text-center text-[var(--text-muted)] bg-transparent">
               <Activity className="w-16 h-16 mb-6 opacity-10" />
               <h4 className="text-sm font-black uppercase tracking-[0.3em]">Decision Support Idle</h4>
            </div>
          ) : loading ? (
            <div className="h-full glass-panel flex flex-col items-center justify-center p-20 text-center">
               <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
               <h4 className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em]">{t.common.loading}</h4>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
               <div className="glass-panel p-8 border-indigo-500/30 text-[var(--text-main)]">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Verified Report</span>
                      <h4 className="text-4xl font-black tracking-tighter mt-4 uppercase">{analysis.severity}</h4>
                    </div>
                  </div>

                  <div className="p-6 bg-[var(--input-bg)] rounded-3xl border border-[var(--border-panel)]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t.reports.summary}</p>
                    <p className="text-sm font-medium leading-relaxed italic">
                      "{analysis.summary}"
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-8 text-[var(--text-main)]">
                     <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Navigation className="w-4 h-4" /> {t.reports.safetySteps}
                     </h5>
                     <div className="space-y-3">
                        {analysis.safetySteps.map((step, i) => (
                           <div key={i} className="flex items-start gap-4 p-4 bg-[var(--input-bg)] rounded-2xl border border-[var(--border-panel)]">
                              <span className="w-6 h-6 shrink-0 bg-indigo-500 text-white flex items-center justify-center rounded-lg text-[10px] font-black">{i+1}</span>
                              <p className="text-xs font-bold text-slate-400 uppercase leading-tight tracking-tight">{step}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="glass-panel p-8 flex flex-col text-[var(--text-main)]">
                     <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {t.reports.impact}
                     </h5>
                     <div className="flex-1 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-panel)] p-6 flex items-center justify-center text-center">
                        <p className="text-xs font-bold text-slate-300 uppercase leading-relaxed tracking-wider">
                           {analysis.estimatedImpact}
                        </p>
                     </div>
                     <button className="w-full mt-6 py-4 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">
                        {t.reports.dispatchUnits}
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentReporting;
