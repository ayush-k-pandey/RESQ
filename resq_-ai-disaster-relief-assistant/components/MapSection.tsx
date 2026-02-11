
import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import { DisasterZone, ZoneType } from '../types';
import { MapPin, Info, AlertTriangle, Search, Loader2, ShieldCheck, Hospital, Shield, Globe, Map as MapIcon } from 'lucide-react';
import { generateAreaRiskZones, searchNearbyPlaces, MapGroundingResult } from '../services/geminiService';

const RecenterMap: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
  return null;
};

interface MapSectionProps {
  initialQuery?: string;
  language: string;
  t: any;
}

const MapSection: React.FC<MapSectionProps> = ({ initialQuery, language, t }) => {
  const [zones, setZones] = useState<DisasterZone[]>([]);
  const [activeZone, setActiveZone] = useState<DisasterZone | null>(null);
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default center of India
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [isDisasterActive, setIsDisasterActive] = useState(false);
  const [statusSummary, setStatusSummary] = useState('');
  const [groundingResults, setGroundingResults] = useState<MapGroundingResult | null>(null);
  const [mapMode, setMapMode] = useState<'tactical' | 'live'>('live');

  const performSurveillance = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setGroundingResults(null);
    try {
      const result = await generateAreaRiskZones(query, language);
      setCenter(result.center);
      setZones(result.zones);
      setIsDisasterActive(result.isDisasterActive);
      setStatusSummary(result.statusSummary);
      setActiveZone(null);

      // Default to live map if no disaster, tactical if disaster is active
      setMapMode(result.isDisasterActive ? 'tactical' : 'live');

      if (!result.isDisasterActive) {
        const places = await searchNearbyPlaces("Emergency services, hospitals, and police stations", result.center[0], result.center[1], language);
        setGroundingResults(places);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSurveillance(initialQuery);
    }
  }, [initialQuery, performSurveillance]);

  const getZoneColor = (type: ZoneType) => {
    switch (type) {
      case ZoneType.RED: return '#ef4444';
      case ZoneType.YELLOW: return '#eab308';
      case ZoneType.GREEN: return '#22c55e';
      default: return '#6b7280';
    }
  };

  const handleAreaSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSurveillance(searchQuery);
  };

  const googleMapEmbedUrl = searchQuery 
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.API_KEY}&q=${encodeURIComponent(searchQuery + ", India")}`
    : `https://www.google.com/maps/embed/v1/view?key=${process.env.API_KEY}&center=${center[0]},${center[1]}&zoom=10`;

  return (
    <div className="space-y-4">
      <form onSubmit={handleAreaSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.map.searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border-panel)] rounded-xl text-sm focus:border-indigo-500 focus:outline-none text-[var(--text-main)] transition-all"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-action bg-indigo-600 px-8 py-3 text-xs text-white flex items-center justify-center gap-2 min-w-[140px] hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {t.common.execute}
        </button>
      </form>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl relative min-h-[600px] border border-[var(--border-panel)] bg-slate-900">
          {/* View Toggle */}
          <div className="absolute top-6 right-6 z-[1000] flex bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setMapMode('live')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mapMode === 'live' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Globe className="w-3.5 h-3.5" /> Google Live
            </button>
            <button 
              onClick={() => setMapMode('tactical')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mapMode === 'tactical' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Tactical
            </button>
          </div>

          {mapMode === 'live' ? (
            <iframe
              width="100%"
              height="600"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={googleMapEmbedUrl}
              className="grayscale-[0.2] contrast-[1.1]"
            ></iframe>
          ) : (
            <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: '600px' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {zones.map((zone) => (
                <Circle
                  key={zone.id}
                  center={zone.coordinates}
                  radius={zone.radius}
                  pathOptions={{
                    fillColor: getZoneColor(zone.type),
                    color: getZoneColor(zone.type),
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.35,
                  }}
                  eventHandlers={{
                    click: () => {
                      setActiveZone(zone);
                      setMapMode('tactical');
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-sm uppercase">{zone.name}</h3>
                      <p className="text-xs text-gray-600">{zone.description}</p>
                    </div>
                  </Popup>
                </Circle>
              ))}
              <RecenterMap coords={center} />
            </MapContainer>
          )}
          
          <div className="absolute bottom-6 left-6 z-[1000] glass-panel p-4 border-white/10 bg-black/70 backdrop-blur-xl">
            <div className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-widest">
              {isDisasterActive ? (
                <>
                  <div className="flex items-center gap-2 text-rose-500">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span> {t.map.redZone}
                  </div>
                  <div className="flex items-center gap-2 text-amber-500">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span> {t.map.yellowZone}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span> {t.map.greenZone}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> REGION SECURE
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-96 flex flex-col gap-4">
          <div className="glass-panel p-8 flex-1 overflow-y-auto border-indigo-500/10 bg-slate-900/40">
            <h2 className="text-[10px] font-black mb-6 flex items-center gap-2 uppercase tracking-[0.3em] text-indigo-400">
              <Info className="w-4 h-4" />
              {t.map.intelFeed}
            </h2>
            
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.common.loading}</p>
              </div>
            ) : isDisasterActive && activeZone ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className={`p-5 border-l-4 rounded-2xl flex items-start gap-3 ${
                  activeZone.type === ZoneType.RED ? 'bg-rose-500/10 border-rose-500 text-rose-300' : 
                  activeZone.type === ZoneType.YELLOW ? 'bg-amber-500/10 border-amber-500 text-amber-300' : 
                  'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                }`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest">{activeZone.name}</h4>
                    <p className="text-xs font-medium leading-relaxed mt-2">{activeZone.description}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.map.protocols}</h4>
                  <div className="space-y-2">
                    {activeZone.instructions.map((inst, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-medium text-slate-300">
                        <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i+1}</span>
                        {inst}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setActiveZone(null)}
                  className="w-full py-3 text-[10px] font-black text-slate-500 hover:text-white uppercase border border-white/5 hover:bg-white/5 rounded-xl transition-all tracking-widest"
                >
                  {t.common.dismiss}
                </button>
              </div>
            ) : !isDisasterActive ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="p-5 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-2xl">
                   <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Safe Status Confirmed</h4>
                   </div>
                   <p className="text-xs text-emerald-300/80 leading-relaxed italic">"{statusSummary}"</p>
                </div>

                {groundingResults && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Nearby Safety Infrastructure</h4>
                    <div className="space-y-2">
                      {groundingResults.links.slice(0, 5).map((link, i) => (
                        <a 
                          key={i} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group"
                        >
                           <div className="flex items-center gap-3">
                              {link.title.toLowerCase().includes('hospital') ? <Hospital className="w-4 h-4 text-rose-400" /> : <Shield className="w-4 h-4 text-blue-400" />}
                              <span className="text-[11px] font-bold text-slate-300 group-hover:text-white truncate max-w-[150px]">{link.title}</span>
                           </div>
                           <MapPin className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400" />
                        </a>
                      ))}
                    </div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase italic">Powered by Google Live Grounding</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 py-10">
                <MapIcon className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest">{t.map.selectZone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSection;
