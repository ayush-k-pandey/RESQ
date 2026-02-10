
import React, { useState } from 'react';
import { Search, MapPin, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { searchNearbyPlaces, MapGroundingResult } from '../services/geminiService';

interface PlaceSearchProps {
  language: string;
  t: any;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({ language, t }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MapGroundingResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const data = await searchNearbyPlaces(query, latitude, longitude, language);
        setResult(data);
        setLoading(false);
      },
      async () => {
        // Fallback to Mumbai for India context if geo fails
        const data = await searchNearbyPlaces(query, 19.0760, 72.8777, language);
        setResult(data);
        setLoading(false);
      }
    );
  };

  return (
    <div className="card-flat p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{language === 'hi' ? 'एआई इंटेलिजेंस मानचित्र खोज' : 'AI Intelligence Map Search'}</h3>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={language === 'hi' ? "उदा., आस-पास के सामुदायिक अस्पतालों की खोज करें..." : "e.g., Search for nearby community hospitals..."}
          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-sm text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-3 text-xs font-bold uppercase flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {language === 'hi' ? 'एआई से पूछें' : 'Ask AI'}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-300">
          <div className="p-4 bg-gray-50 border border-gray-200 text-sm text-gray-700 leading-relaxed font-medium">
            {result.text}
          </div>

          {result.links.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.links.map((link, i) => (
                <a
                  key={i}
                  href={link.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 hover:border-blue-400 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-bold text-gray-700">{link.title}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-500" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;
