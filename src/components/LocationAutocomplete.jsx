import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Plane, 
  Train, 
  Building2, 
  Search, 
  X, 
  Navigation,
  Compass,
  Check
} from 'lucide-react';
import { searchIndiaLocations } from '../utils/indiaLocations';

export default function LocationAutocomplete({
  value,
  onChange,
  onSelectLocation,
  placeholder = 'Type city, station, airport in India...',
  label,
  icon: LeadingIcon = MapPin,
  className = '',
  required = false
}) {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingWeb, setIsLoadingWeb] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Search locations locally and via Geocoding API
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    // 1. Instant local indexed matches
    const localMatches = searchIndiaLocations(trimmed);
    setSuggestions(localMatches);

    // 2. Always fetch live Geocoding API for addresses, streets, towns all over India
    if (trimmed.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          setIsLoadingWeb(true);
          const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed + ' India')}&limit=6`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data?.features?.length > 0) {
              const liveItems = data.features.map((f) => {
                const props = f.properties || {};
                const title = props.name || trimmed;
                const subtitle = [props.city || props.district, props.state, 'India']
                  .filter(Boolean)
                  .join(', ');
                const fullName = subtitle ? `${title}, ${subtitle}` : `${title}, India`;

                return {
                  name: fullName,
                  city: props.city || props.district || 'India',
                  state: props.state || 'India',
                  category: props.osm_value === 'aeroway' ? 'airport' : props.osm_value === 'railway' ? 'railway' : 'city',
                  lat: f.geometry?.coordinates?.[1] || 13.0827,
                  lng: f.geometry?.coordinates?.[0] || 80.2707,
                  pincode: props.postcode || '',
                  isLiveResult: true
                };
              });

              setSuggestions((prev) => {
                const combined = [...prev];
                for (const item of liveItems) {
                  if (!combined.some(c => c.name.toLowerCase() === item.name.toLowerCase())) {
                    combined.push(item);
                  }
                }
                return combined.slice(0, 10);
              });
            }
          }
        } catch (err) {
          console.debug('Location geocoding API error (fallback to local):', err.message);
        } finally {
          setIsLoadingWeb(false);
        }
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const locationString = item.pincode ? `${item.name} (${item.pincode})` : item.name;
    setQuery(locationString);
    setIsOpen(false);
    if (onChange) {
      onChange(locationString);
    }
    if (onSelectLocation) {
      onSelectLocation(item);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    if (onChange) onChange('');
    inputRef.current?.focus();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'airport':
        return <Plane className="w-3.5 h-3.5 text-blue-500" />;
      case 'railway':
        return <Train className="w-3.5 h-3.5 text-amber-500" />;
      case 'tech_park':
        return <Building2 className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-medium normal-case">All India Auto-Fill</span>
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
          <LeadingIcon className="w-4 h-4 text-indigo-500" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          required={required}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onChange) onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-xs"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-fade-in">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-indigo-500" />
              <span>India-Wide Suggested Hubs & Corridors</span>
            </span>
            {isLoadingWeb && <span className="text-indigo-500 animate-pulse">Searching OSM...</span>}
          </div>

          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No matching Indian location found. Type to search any city or pin code.
            </div>
          ) : (
            <div className="py-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {suggestions.map((loc, idx) => {
                const isSelected = highlightedIndex === idx;
                const isCurrent = (value || '').toLowerCase().includes(loc.name.toLowerCase());
                return (
                  <button
                    key={`${loc.name}-${idx}`}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(loc)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        {getCategoryIcon(loc.category)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate block">{loc.name}</span>
                          {loc.pincode && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                              {loc.pincode}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                          {loc.city ? `${loc.city}, ` : ''}{loc.state} • India
                        </span>
                      </div>
                    </div>

                    {isCurrent && (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
