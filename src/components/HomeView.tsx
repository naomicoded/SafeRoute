/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Phone, 
  MapPin, 
  Heart, 
  ChevronRight, 
  Search, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Compass,
  CornerDownRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmergencyContact, UserProfile } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface HomeViewProps {
  contacts: EmergencyContact[];
  profile: UserProfile;
  onSosClick: () => void;
  sosActive: boolean;
  safetyStatus: 'safe' | 'monitoring' | 'danger';
  simulateCall: (name: string, phone: string) => void;
  onNavigateToTab: (tabId: string) => void;
  activeTimer: { isActive: boolean; timeLeft: number; totalTime: number; destination: string };
  onStartTimer: (minutes: number, destination: string) => void;
  onStopTimer: (arrivedSafely: boolean) => void;
  onExtendTimer: (minutes: number) => void;
  userPos: { x: number; y: number };
  setUserPos: (pos: { x: number; y: number }) => void;
}

export function HomeView({
  contacts,
  profile,
  onSosClick,
  sosActive,
  safetyStatus,
  simulateCall,
  onNavigateToTab,
  activeTimer,
  onStartTimer,
  onStopTimer,
  onExtendTimer,
  userPos,
  setUserPos,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState(15); // minutes

  const presets = [
    { label: '🏠 Nach Hause', query: 'Zürichsee, Seestrasse 142' },
    { label: '🚉 Hauptbahnhof', query: 'Bahnhofplatz, Zürich' },
    { label: '🎓 Universität', query: 'Rämistrasse 101, Zürich' },
    { label: '❤️ Svenjas Wohnung', query: 'Limmatweg 4, Zürich' },
  ];

  const handleSelectPreset = (label: string, query: string) => {
    setSearchQuery(query);
    setSelectedDestination(label);
    // Randomize duration slightly to feel highly real
    const randTime = label.includes('Hause') ? 12 : label.includes('Bahnhof') ? 8 : label.includes('Uni') ? 18 : 15;
    setEstimatedDuration(randTime);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedDestination(searchQuery.trim());
      setEstimatedDuration(20); // Default simulated route duration
    }
  };

  const clearRouteSearch = () => {
    setSearchQuery('');
    setSelectedDestination(null);
  };

  const formatTimerLabel = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Status configuration details
  const getStatusConfig = () => {
    if (sosActive) {
      return {
        bg: 'bg-rose-50 border-rose-250 text-rose-800',
        dot: 'bg-rose-500',
        label: 'SOS ALARM ACTIVE',
        details: 'Notfallhelfer wurden sofort verständigt.',
      };
    }
    if (activeTimer.isActive) {
      return {
        bg: 'bg-teal-50 border-teal-200 text-teal-900',
        dot: 'bg-teal-500',
        label: 'Heimweg-Schutz Aktiv',
        details: `Begleiter überwacht den Weg nach: ${activeTimer.destination}`,
      };
    }
    return {
      bg: 'bg-sky-50/70 border-sky-100 text-sky-900',
      dot: 'bg-sky-500',
      label: 'SafeRoute Bereit',
      details: 'Du bist geschützt. Such ein Ziel oder drück SOS.',
    };
  };

  const statusConfig = getStatusConfig();
  const primaryContacts = contacts.slice(0, 3);

  // Compute ETA clock format
  const getETAString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + estimatedDuration);
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    return `${estimatedDuration} Min. (Ankunft ca. ${hrs}:${mins} Uhr)`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-4 px-0.5 scrollbar-none text-left bg-white" id="home-view-container">
      
      {/* 1. Begrüssung des Benutzers */}
      <div className="flex justify-between items-center mb-3 pt-1" id="home-header-section">
        <div>
          <span className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest font-mono">Dein Begleiter</span>
          <h1 className="text-xl font-black tracking-tight text-slate-900 mt-0.5">
            Hallo, {profile.firstName || 'Amina'} 👋
          </h1>
        </div>

        {/* Live-Standort quick info badge */}
        <button 
          onClick={() => onNavigateToTab('map')}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 transition-colors rounded-full border border-teal-100/60 text-[9px] font-mono font-bold text-teal-700 uppercase"
        >
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-400"></span>
          </span>
          <span>Live Ortung</span>
        </button>
      </div>

      {/* 2. Anzeige des Sicherheitsstatus */}
      <div className={`px-3 py-2.5 rounded-2xl border ${statusConfig.bg} transition-all duration-300 mb-3.5`} id="safety-status-card">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-black uppercase tracking-wide text-slate-800 block">{statusConfig.label}</span>
            <span className="text-[10.5px] text-slate-650 truncate block mt-0.5">{statusConfig.details}</span>
          </div>
        </div>
      </div>

      {/* 3. INTERAKTIVE KARTE ALS HAUPTELEMENT */}
      <div className="relative flex-1 min-h-[220px] rounded-2xl overflow-hidden mb-3.5" id="interactive-map-area">
        <InteractiveMap
          userPos={userPos}
          onMapClick={(x, y) => setUserPos({ x, y })}
          showRouteTo={selectedDestination}
        />

        {/* Floating SOS button right over the map screen */}
        <div className="absolute bottom-3 right-3 z-30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSosClick}
            id="floating-sos-trigger"
            className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-white shadow-lg pointer-events-auto border-4 border-white ${
              sosActive
                ? 'bg-gradient-to-br from-rose-500 to-red-650 shadow-rose-200'
                : 'bg-gradient-to-br from-teal-500 via-teal-405 to-sky-500 shadow-teal-100'
            }`}
          >
            <span className="text-sm font-black tracking-wider uppercase font-mono">SOS</span>
          </motion.button>
        </div>

        {/* Floating Custom Search Engine input ("Wohin möchtest du gehen?") */}
        <div className="absolute top-3 left-3 right-3 z-30 pointer-events-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Wohin möchtest du gehen?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 backdrop-blur-xs pl-9 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-200 shadow-md focus:border-teal-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearRouteSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold bg-transparent border-0 text-[10px]"
              >
                Löschen
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Active Wayhome Timer overlay mode */}
      <AnimatePresence>
        {activeTimer.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-3 bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-150 rounded-2xl mb-3.5 flex flex-col gap-2.5"
            id="active-timer-home-banner"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600 animate-spin-slow" />
                <span className="text-[11px] font-black text-teal-900 font-mono uppercase">HEIMWEG-TIMER AKTIV</span>
              </div>
              <span className="text-sm font-mono font-black text-teal-600 leading-none">
                {formatTimerLabel(activeTimer.timeLeft)}
              </span>
            </div>

            <p className="text-[10px] text-slate-600 leading-tight">
              Dein Live-Standort wird mit <strong>{contacts.filter(c => c.isTrusted).length} Vertrauenspersonen</strong> geteilt.
            </p>

            <div className="flex gap-1.5">
              <button
                onClick={() => onExtendTimer(5)}
                className="flex-1 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-teal-600 text-[10px] font-black rounded-xl font-mono cursor-pointer"
              >
                +5 Min.
              </button>
              <button
                onClick={() => onStopTimer(true)}
                className="flex-2 py-1.5 bg-tea-500 bg-teal-500 text-white text-[10px] font-black rounded-xl cursor-pointer hover:bg-teal-600 shadow-sm"
              >
                Sicher Angekommen ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. NAVIGATION SECTION (If destination is Selected, show Route Stats and option to start wayhome) */}
      <AnimatePresence>
        {selectedDestination && !activeTimer.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl mb-3.5 space-y-2.5"
            id="navigation-details-panel"
          >
            <div className="flex justify-between items-start border-b border-slate-200/50 pb-2">
              <div>
                <span className="text-[9px] text-teal-600 font-extrabold font-mono uppercase tracking-widest block">Ausgewählte Route</span>
                <h4 className="text-xs font-black text-slate-800">{selectedDestination}</h4>
              </div>
              <button 
                onClick={clearRouteSearch}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
              >
                Zurücksetzen
              </button>
            </div>

            {/* Simulated Safe Route Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 border border-slate-100 rounded-xl flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                <div className="text-left font-sans">
                  <span className="text-[8px] text-slate-400 font-mono block uppercase">Ankunftszeit</span>
                  <span className="text-[10px] text-slate-700 font-extrabold whitespace-nowrap">{getETAString()}</span>
                </div>
              </div>

              <div className="bg-white p-2 border border-slate-100 rounded-xl flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-500 shrink-0" />
                <div className="text-left font-sans">
                  <span className="text-[8px] text-slate-400 font-mono block uppercase">Sicherheit</span>
                  <span className="text-[10px] text-teal-600 font-extrabold">98% Beleuchtet</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-medium leading-relaxed bg-white/80 p-2 rounded-xl border border-slate-200/30 flex items-start gap-1">
              <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span>Idealer Heimweg gefunden: Bevorzugt breite, beleuchtete Spazierwege in Seenähe.</span>
            </div>

            {/* Start Timer mode button */}
            <button
              onClick={() => {
                onStartTimer(estimatedDuration, selectedDestination);
                clearRouteSearch();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-50 flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
            >
              <span>Uhrbegleiter & Heimweg-Schutz starten</span>
              <CornerDownRight className="w-3.5 h-3.5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Destination Presets grid when no destination is currently active */}
      {!selectedDestination && !activeTimer.isActive && (
        <div className="mb-4" id="preset-routes-area">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest pl-1 font-mono block mb-1.5">Häufige Heimwegziele</span>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSelectPreset(preset.label, preset.query)}
                className="p-2 border border-slate-100 hover:border-teal-150 rounded-xl text-left bg-slate-50 text-[10.5px] text-slate-700 font-bold transition-all flex items-center justify-between group active:scale-95 cursor-pointer"
              >
                <span>{preset.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-350 group-hover:text-teal-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Schnellzugriff auf Notfallkontakte */}
      <div className="space-y-2" id="home-contacts-section">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" /> Schnellwahl Notrufe
          </h3>
          <button
            onClick={() => onNavigateToTab('contacts')}
            className="text-[9px] font-bold text-teal-600 hover:text-teal-750 underline bg-transparent"
          >
            Alle Kontakte
          </button>
        </div>

        {primaryContacts.length === 0 ? (
          <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
            Keine Kontakte hinterlegt.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2" id="contacts-quick-strip">
            {primaryContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => simulateCall(contact.name, contact.phone)}
                className="bg-slate-50 hover:bg-slate-100 flex flex-col items-center p-2.5 rounded-2xl border border-slate-100 text-center cursor-pointer transition-transform duration-150 active:scale-95 group"
                title={`Notruf an ${contact.name}`}
              >
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 text-teal-600 font-mono text-xs font-black flex items-center justify-center mb-1 group-hover:border-teal-400 overflow-hidden shrink-0">
                  {contact.photoUrl ? (
                    <img src={contact.photoUrl} alt={contact.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    contact.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-[10.5px] font-bold text-slate-800 truncate w-full">{contact.name.split(' ')[0]}</span>
                <span className="text-[8.5px] text-slate-400 font-mono truncate w-full mt-0.5">{contact.relation}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 7. QUICK LINK to Live-Standort settings with information */}
      <div 
        onClick={() => onNavigateToTab('map')}
        className="mt-4 bg-sky-50/40 hover:bg-sky-50/80 border border-sky-100/50 p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-left font-sans">
            <h4 className="text-[11px] font-bold text-slate-800">Echtzeit Ortungsdaten</h4>
            <span className="text-[9.5px] text-slate-500">Klicke hier, um Berechtigungen einzusehen</span>
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </div>

    </div>
  );
}
