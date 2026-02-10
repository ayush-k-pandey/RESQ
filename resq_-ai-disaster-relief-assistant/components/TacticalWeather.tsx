
import React from 'react';
/* Added Activity to the imports to resolve the reference error on line 143 */
import { Cloud, Sun, CloudRain, CloudLightning, Wind, Droplets, Eye, Activity } from 'lucide-react';
import { WeatherData } from '../services/geminiService';

interface TacticalWeatherProps {
  data: WeatherData;
  language: string;
}

const TacticalWeather: React.FC<TacticalWeatherProps> = ({ data, language }) => {
  const getBackground = () => {
    switch (data.condition) {
      case 'Clear': return 'from-blue-600/20 to-indigo-900/20';
      case 'Rain': return 'from-slate-700/30 to-slate-900/30';
      case 'Storm': return 'from-slate-900/40 to-black/40';
      case 'Cloudy': return 'from-gray-500/20 to-slate-800/20';
      default: return 'from-indigo-600/10 to-transparent';
    }
  };

  const renderAnimation = () => {
    switch (data.condition) {
      case 'Rain':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="absolute bg-blue-400 w-[1px] h-4" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `-${Math.random() * 20}%`,
                  animation: `rainfall ${0.5 + Math.random()}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
            <style>{`
              @keyframes rainfall {
                0% { transform: translateY(0); }
                100% { transform: translateY(600px); }
              }
            `}</style>
          </div>
        );
      case 'Storm':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute inset-0 bg-indigo-500/0 animate-lightning"></div>
             <style>{`
               @keyframes lightning {
                 0%, 95%, 100% { background-color: rgba(99, 102, 241, 0); }
                 96%, 98% { background-color: rgba(255, 255, 255, 0.15); }
               }
               .animate-lightning { animation: lightning 5s infinite; }
             `}</style>
             {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="absolute bg-slate-300 w-[1.5px] h-6" 
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `-${Math.random() * 20}%`,
                  animation: `rainfall 0.4s linear infinite`,
                  animationDelay: `${Math.random() * 1}s`
                }}
              />
            ))}
          </div>
        );
      case 'Clear':
        return (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="w-32 h-32 border border-amber-500/10 rounded-full animate-ping [animation-duration:4s]"></div>
          </div>
        );
      case 'Cloudy':
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="absolute top-10 -left-20 w-40 h-10 bg-white/10 rounded-full blur-xl animate-drift"></div>
            <div className="absolute top-32 -left-32 w-64 h-16 bg-white/5 rounded-full blur-2xl animate-drift [animation-duration:25s]"></div>
            <style>{`
              @keyframes drift {
                0% { transform: translateX(0); }
                100% { transform: translateX(800px); }
              }
              .animate-drift { animation: drift 15s linear infinite; }
            `}</style>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`relative glass-panel overflow-hidden border-indigo-500/30 bg-gradient-to-br ${getBackground()} p-8 flex flex-col md:flex-row items-center gap-10 transition-all duration-700`}>
      {renderAnimation()}
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="mb-4 p-4 bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
          {data.condition === 'Clear' && <Sun className="w-16 h-16 text-amber-400" />}
          {data.condition === 'Rain' && <CloudRain className="w-16 h-16 text-blue-400" />}
          {data.condition === 'Storm' && <CloudLightning className="w-16 h-16 text-slate-300" />}
          {data.condition === 'Cloudy' && <Cloud className="w-16 h-16 text-gray-300" />}
        </div>
        <h4 className="text-sm font-black text-white uppercase tracking-widest">{data.conditionText}</h4>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-6xl font-black text-white tracking-tighter tabular-nums">{Math.round(data.temp)}</span>
          <span className="text-2xl font-black text-indigo-400 tracking-tighter">°C</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'hi' ? 'आर्द्रता' : 'Humidity'}</span>
          </div>
          <p className="text-xl font-black text-white tabular-nums">{data.humidity}%</p>
        </div>
        
        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Wind className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'hi' ? 'हवा' : 'Wind'}</span>
          </div>
          <p className="text-xl font-black text-white tabular-nums">{data.windSpeed}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">{data.windDir}</p>
        </div>

        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'hi' ? 'दृश्यता' : 'Visibility'}</span>
          </div>
          <p className="text-xl font-black text-white tabular-nums">{data.visibility}</p>
        </div>

        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language === 'hi' ? 'सिस्टम' : 'System'}</span>
          </div>
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Link Established</p>
          <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalWeather;
