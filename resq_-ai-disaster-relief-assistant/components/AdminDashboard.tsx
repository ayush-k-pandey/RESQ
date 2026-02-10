
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertOctagon, 
  Send, 
  ShieldAlert, 
  Activity,
  Users,
  Clock,
  X,
  Loader2,
  CheckCircle2,
  Lock,
  Search,
  MapPin,
  Smartphone,
  Calendar
} from 'lucide-react';
import { broadcastProfessionalAlert } from '../services/geminiService';
import { NewsUpdate, UserData } from '../types';

interface Incident {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Reported' | 'In-Progress' | 'Containment' | 'Resolved';
  lastUpdated: string;
  location: string;
}

interface AdminDashboardProps {
  onBroadcast?: (alert: NewsUpdate) => void;
  language: string;
  t: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBroadcast, language, t }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  const [incidents, setIncidents] = useState<Incident[]>([
    { id: '1', name: 'Lower Manhattan Flood', severity: 'Critical', status: 'In-Progress', lastUpdated: '2 mins ago', location: 'New York, NY' },
    { id: '2', name: 'Queens Power Outage', severity: 'Medium', status: 'Reported', lastUpdated: '14 mins ago', location: 'Queens, NY' },
    { id: '3', name: 'Brooklyn Gas Leak', severity: 'High', status: 'Containment', lastUpdated: '31 mins ago', location: 'Brooklyn, NY' }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    severity: 'Medium',
    status: 'Reported'
  });

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  // User Lookup Feature
  const [searchUserId, setSearchUserId] = useState('');
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [lookupError, setLookupError] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPassword('');
    }
  };

  const handleUserLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(false);
    setFoundUser(null);
    
    const userRegistry = JSON.parse(localStorage.getItem('AIDRA_USER_REGISTRY') || '{}');
    const user = userRegistry[searchUserId.trim()];
    
    if (user) {
      setFoundUser(user);
    } else {
      setLookupError(true);
    }
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const incident: Incident = {
      id: Math.random().toString(36).substr(2, 9),
      name: (e.target as any).elements[0].value || 'Unnamed Incident',
      severity: (newIncident.severity as any) || 'Medium',
      status: 'Reported',
      location: (e.target as any).elements[2].value || 'Unknown',
      lastUpdated: 'Just now'
    };
    setIncidents([incident, ...incidents]);
    setIsFormOpen(false);
    setNewIncident({ severity: 'Medium', status: 'Reported' });
  };

  const handleExecuteBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setBroadcasting(true);
    try {
      const alert = await broadcastProfessionalAlert(broadcastMessage, language);
      onBroadcast?.(alert);
      setBroadcastMessage('');
      setBroadcastDone(true);
      setTimeout(() => setBroadcastDone(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setBroadcasting(false);
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-700 font-bold';
      case 'High': return 'text-orange-700 font-bold';
      case 'Medium': return 'text-yellow-700 font-bold';
      default: return 'text-green-700 font-bold';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-[600px] flex items-center justify-center p-6">
        <div className="glass-panel p-10 max-w-sm w-full border-indigo-500/30 text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Restricted Console</h3>
          <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">Authorization required to access tactical operations and field telemetry.</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Authorization Key"
              className={`w-full bg-[var(--input-bg)] border ${authError ? 'border-rose-500' : 'border-[var(--border-panel)]'} rounded-xl px-5 py-3 text-sm text-center focus:outline-none focus:border-indigo-500 transition-all font-black tracking-[0.4em]`}
            />
            {authError && <p className="text-[10px] font-black text-rose-500 uppercase">Invalid Access Key</p>}
            <button 
              type="submit"
              className="w-full btn-action bg-indigo-600 py-4 text-white text-xs font-black shadow-xl shadow-indigo-600/20"
            >
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HUD Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: language === 'hi' ? 'घटनाएं' : 'Incidents', value: incidents.length, icon: AlertOctagon, color: 'text-red-600' },
          { label: language === 'hi' ? 'एजेंट' : 'Agents', value: '1,284', icon: Users, color: 'text-blue-600' },
          { label: language === 'hi' ? 'प्रतिक्रिया' : 'Response', value: '12m', icon: Clock, color: 'text-green-600' },
          { label: language === 'hi' ? 'आपूर्ति' : 'Supply', value: '62%', icon: Activity, color: 'text-orange-600' }
        ].map((stat, i) => (
          <div key={i} className="card-flat p-4 flex items-center gap-4 bg-[var(--bg-panel)]">
            <div className="p-3 bg-gray-50/5 border border-gray-100/10 rounded-sm">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-[var(--text-main)] leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-[var(--text-main)] uppercase text-sm tracking-wider">{language === 'hi' ? 'परिचालन कतार' : 'Operational Queue'}</h3>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="btn-primary px-4 py-2 text-xs font-bold uppercase flex items-center gap-2"
            >
              <Plus className="w-3 h-3" /> {language === 'hi' ? 'नया लॉग' : 'New Log'}
            </button>
          </div>

          <div className="card-flat overflow-x-auto bg-[var(--bg-panel)]">
            <table className="w-full text-left text-sm text-[var(--text-main)]">
              <thead className="bg-gray-50/5 border-b border-gray-200/10">
                <tr>
                  <th className="px-4 py-3 font-bold text-gray-400 uppercase text-[10px]">Title</th>
                  <th className="px-4 py-3 font-bold text-gray-400 uppercase text-[10px]">Severity</th>
                  <th className="px-4 py-3 font-bold text-gray-400 uppercase text-[10px]">Status</th>
                  <th className="px-4 py-3 font-bold text-gray-400 uppercase text-[10px]">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/10">
                {incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold">{incident.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{incident.location}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase ${getSeverityClass(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{incident.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => setIncidents(prev => prev.filter(i => i.id !== incident.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tactical Tools Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Lookup Tool */}
          <div className="card-flat overflow-hidden bg-[var(--bg-panel)] border-indigo-500/30">
            <div className="bg-indigo-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Search className="w-3.5 h-3.5" /> Intelligence Lookup
            </div>
            <div className="p-5 space-y-4">
              <form onSubmit={handleUserLookup} className="flex gap-2">
                <input 
                  type="text" 
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  placeholder="Query NODE ID (e.g. NODE-XXXX)"
                  className="flex-1 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 px-4 rounded-xl hover:bg-indigo-500 transition-colors">
                  <Activity className="w-4 h-4 text-white" />
                </button>
              </form>

              {lookupError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[10px] font-black text-rose-500 uppercase">Node ID Not Found</span>
                </div>
              )}

              {foundUser && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Status: Active</p>
                        <h4 className="text-sm font-black text-white mt-1">{foundUser.id}</h4>
                      </div>
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase">
                          {foundUser.lastLocation ? `${foundUser.lastLocation.lat.toFixed(4)}, ${foundUser.lastLocation.lng.toFixed(4)}` : 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase">
                          {new Date(foundUser.lastLogin).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {foundUser.lastLocation && (
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps?q=${foundUser.lastLocation?.lat},${foundUser.lastLocation?.lng}`, '_blank')}
                        className="w-full mt-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        OPEN SURVEILLANCE MAP
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Broadcast Tool */}
          <div className="card-flat overflow-hidden bg-[var(--bg-panel)]">
            <div className="bg-slate-800 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest">{language === 'hi' ? 'ग्लोबल डिस्पैचर' : 'Global Dispatcher'}</div>
            <div className="p-4 space-y-4">
              <textarea 
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3 text-xs focus:outline-none focus:border-blue-500 h-32 text-white placeholder:text-slate-600"
                placeholder={language === 'hi' ? "आपातकालीन प्रसारण लिखें..." : "Compose emergency broadcast..."}
              />
              <button 
                onClick={handleExecuteBroadcast}
                disabled={!broadcastMessage.trim() || broadcasting}
                className="w-full btn-danger py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-900/20"
              >
                {broadcasting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {broadcastDone ? (language === 'hi' ? "संकेत भेजा गया" : "Signal Transmitted") : (language === 'hi' ? "भेजें" : "Execute Send")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-app)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border-panel)]">
            <div className="bg-slate-800/50 p-4 border-b border-[var(--border-panel)] flex justify-between items-center">
              <h3 className="font-bold text-white uppercase text-sm">System Log Entry</h3>
              <button onClick={() => setIsFormOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddIncident} className="p-6 space-y-4 text-[var(--text-main)]">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Incident Label</label>
                <input required type="text" className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm focus:outline-none focus:border-indigo-500 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Severity</label>
                  <select 
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({...newIncident, severity: e.target.value as any})}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm focus:outline-none focus:border-indigo-500 rounded-xl"
                  >
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Zone</label>
                  <input required type="text" className="w-full bg-[var(--input-bg)] border border-[var(--border-panel)] p-3 text-sm focus:outline-none focus:border-indigo-500 rounded-xl" />
                </div>
              </div>
              <button type="submit" className="w-full btn-primary py-3 font-bold uppercase text-sm shadow-xl">Save & Log</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
