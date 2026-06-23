/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Share2, MapPin, Compass, ShieldCheck, RefreshCw, Smartphone, Check, Heart } from 'lucide-react';
import { EmergencyContact, LocationMarker } from '../types';

interface MapViewProps {
  contacts: EmergencyContact[];
  isLocationSharingActive: boolean;
  onToggleLocationSharing: (active: boolean) => void;
  userPos: { x: number; y: number };
  setUserPos: (pos: { x: number; y: number }) => void;
}

export function MapView({
  contacts,
  isLocationSharingActive,
  onToggleLocationSharing,
  userPos,
  setUserPos,
}: MapViewProps) {
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);
  const [activePathStep, setActivePathStep] = useState(0);

  // Simulated street elements to draw a custom vector city layout (0 to 100 percentages)
  const streets = [
    { name: 'Seestrasse', x1: 5, y1: 25, x2: 95, y2: 25 },
    { name: 'Bahnhofstrasse', x1: 25, y1: 5, x2: 25, y2: 95 },
    { name: 'Limmatweg', x1: 5, y1: 65, x2: 95, y2: 65 },
    { name: 'Postgasse', x1: 65, y1: 25, x2: 65, y2: 95 },
  ];

  const markers: LocationMarker[] = [
    { id: 'me', name: 'Dein Standort', type: 'me', lat: userPos.y, lng: userPos.x },
    { id: 'p1', name: 'Polizeiposten Central', type: 'police', lat: 25, lng: 15, description: '24h Besetzt' },
    { id: 'sz1', name: 'Kiosk Central (SafeZone)', type: 'safe_zone', lat: 65, lng: 50, description: 'Zertifizierter Schutzraum' },
    { id: 'sz2', name: 'Restaurant Ochsen', type: 'safe_zone', lat: 25, lng: 80, description: 'Sicherer Zufluchtsort' },
  ];

  const walkPath = [
    { x: 25, y: 85 },
    { x: 25, y: 65 },
    { x: 45, y: 65 },
    { x: 65, y: 65 },
    { x: 65, y: 45 },
    { x: 65, y: 25 },
    { x: 80, y: 25 },
  ];

  useEffect(() => {
    let timer: any;
    if (isSimulatingWalk) {
      timer = setInterval(() => {
        setActivePathStep((prev) => {
          const nextStep = prev + 1;
          if (nextStep >= walkPath.length) {
            setIsSimulatingWalk(false);
            return 0; // Reset
          }
          setUserPos({ x: walkPath[nextStep].x, y: walkPath[nextStep].y });
          return nextStep;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isSimulatingWalk]);

  const startSimulation = () => {
    setUserPos({ x: walkPath[0].x, y: walkPath[0].y });
    setActivePathStep(0);
    setIsSimulatingWalk(true);
  };

  const stopSimulation = () => {
    setIsSimulatingWalk(false);
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setUserPos({ x: Math.round(x), y: Math.round(y) });
    if (isSimulatingWalk) stopSimulation();
  };

  // Contacts who can see user's location (isTrusted is checked)
  const locationAuraContacts = contacts.filter(c => c.isTrusted);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-4 px-0.5 text-left bg-white scrollbar-none" id="map-view-wrapper">
      
      {/* 6. Live-Standort - Header */}
      <div className="flex justify-between items-start mb-4 pt-1" id="map-header">
        <div>
          <span className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest font-mono">Echtzeit-Ortung</span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">Live-Standort</h2>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-slate-400 font-mono font-bold uppercase leading-none">GPS SIGNAL</span>
          <span className="text-xs font-bold text-teal-600 font-sans flex items-center gap-1 mt-1 leading-none">
            <Compass className="w-3.5 h-3.5 animate-spin-slow text-teal-500" /> ± 3m Genau
          </span>
        </div>
      </div>

      {/* Safety Toggle Card for Live-Standortfreigabe */}
      <div 
        className={`p-3.5 rounded-2xl border transition-all duration-300 mb-4 ${
          isLocationSharingActive 
            ? 'bg-teal-50/70 border-teal-200 shadow-xs' 
            : 'bg-slate-50 border-slate-100'
        }`}
        id="sharing-toggle-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${isLocationSharingActive ? 'bg-teal-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'}`}>
              <Share2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800">Standortfreigabe</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Status: {isLocationSharingActive ? 'Sichern aktiv (Live)' : 'Privat (Auf Anfrage)'}</p>
            </div>
          </div>
          <button
            onClick={() => onToggleLocationSharing(!isLocationSharingActive)}
            id="btn-toggle-sharing"
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer flex items-center ${
              isLocationSharingActive ? 'bg-teal-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${
                isLocationSharingActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isLocationSharingActive ? (
          <div className="text-[10px] text-teal-800/95 mt-2.5 font-sans flex items-start gap-1 p-2 bg-white rounded-xl border border-teal-100">
            <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>Ortungsdienst teilt deine Position live mit ausgewählten Vertrauenskontakten.</span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 mt-2">
            Dein Standort bleibt geschützt, bis du den Heimweg-Modus aktivierst oder ein SOS absetzt.
          </div>
        )}
      </div>

      {/* Map view section */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-100 h-60 shadow-inner mb-4 flex flex-col justify-between" id="map-canvas-container">
        
        {/* Draw Vector map */}
        <svg 
          className="absolute inset-0 w-full h-full select-none cursor-crosshair bg-[#fbfdfb]"
          onClick={handleMapClick}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Decorative City parks representation */}
          <rect x="5" y="5" width="15" height="15" className="fill-emerald-100/50 rounded-lg" />
          <rect x="75" y="45" width="20" height="15" className="fill-emerald-100/40 rounded-lg" />
          
          {/* Grid lines */}
          <g opacity="0.15">
            <line x1="0" y1="20" x2="100" y2="20" stroke="#000" strokeWidth="0.1" />
            <line x1="0" y1="40" x2="100" y2="40" stroke="#000" strokeWidth="0.1" />
            <line x1="0" y1="60" x2="100" y2="60" stroke="#000" strokeWidth="0.1" />
            <line x1="0" y1="80" x2="100" y2="80" stroke="#000" strokeWidth="0.1" />
            <line x1="20" y1="0" x2="20" y2="100" stroke="#000" strokeWidth="0.1" />
            <line x1="40" y1="0" x2="40" y2="100" stroke="#000" strokeWidth="0.1" />
            <line x1="60" y1="0" x2="60" y2="100" stroke="#000" strokeWidth="0.1" />
            <line x1="80" y1="0" x2="80" y2="100" stroke="#000" strokeWidth="0.1" />
          </g>

          {/* Streets Drawing */}
          {streets.map((st, idx) => (
            <g key={idx}>
              <line 
                x1={st.x1} 
                y1={st.y1} 
                x2={st.x2} 
                y2={st.y2} 
                className="stroke-slate-200 stroke-[5.5] stroke-linecap-round"
              />
              <line 
                x1={st.x1} 
                y1={st.y1} 
                x2={st.x2} 
                y2={st.y2} 
                className="stroke-white stroke-[4] stroke-linecap-round"
              />
            </g>
          ))}

          {/* Street names */}
          <text x="28" y="45" className="fill-slate-400 font-sans text-[2px] font-bold transform rotate-90 origin-[28px_45px] tracking-wide uppercase">Bahnhofstrasse</text>
          <text x="45" y="23" className="fill-slate-400 font-sans text-[2px] font-bold tracking-wide uppercase">Seestrasse</text>
          <text x="45" y="63" className="fill-slate-400 font-sans text-[2px] font-bold tracking-wide uppercase">Limmatweg</text>

          {/* Path tracker trace in green-blue */}
          {isSimulatingWalk && (
            <polyline 
              points={walkPath.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#0d9488"
              strokeWidth="0.8"
              strokeDasharray="1.5,1"
              className="opacity-70"
            />
          )}

          {/* Landmarks / Safety zones */}
          {markers.map((mk) => {
            if (mk.type === 'me') return null;
            let color = 'fill-cyan-500';
            if (mk.type === 'police') color = 'fill-rose-500';
            else if (mk.type === 'safe_zone') color = 'fill-teal-500';

            return (
              <g key={mk.id}>
                <circle cx={mk.lng} cy={mk.lat} r="3.5" className="fill-teal-100/50 stroke-teal-200 stroke-[0.2]" />
                <circle cx={mk.lng} cy={mk.lat} r="1.5" className={`${color}`} />
              </g>
            );
          })}

          {/* Current User position dot with waves */}
          <g>
            <circle cx={userPos.x} cy={userPos.y} r="5.5" className="fill-sky-100/60 stroke-sky-300 stroke-[0.2]" />
            <circle cx={userPos.x} cy={userPos.y} r="2.5" className="fill-sky-400/40 stroke-teal-400/80 stroke-[0.4] animate-ping" />
            <circle cx={userPos.x} cy={userPos.y} r="1.5" className="fill-sky-500" />
            <circle cx={userPos.x} cy={userPos.y} r="0.6" className="fill-white" />
          </g>
        </svg>

        {/* Float Map Overlay Stats */}
        <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
          <div className="bg-white/95 border border-slate-100 px-2 py-0.5 rounded-lg text-[9px] text-slate-700 font-mono font-extrabold shadow-sm flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-sky-500 shrink-0" />
            <span>Zürich • {userPos.x}N, {userPos.y}O</span>
          </div>
          
          <div className="bg-white/95 border border-slate-150 px-2 py-0.5 rounded-lg text-[9px] text-teal-700 font-mono font-extrabold shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>Filter: Schutzräume an</span>
          </div>
        </div>

        {/* Mini Simulation Controls bar inside mapping */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-auto">
          <span className="text-[9.5px] font-mono text-slate-500 bg-white/80 px-1.5 py-0.5 rounded-md border border-slate-200">
            Karte antippen für GPS-Test
          </span>

          <button
            onClick={isSimulatingWalk ? stopSimulation : startSimulation}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-black tracking-tight flex items-center gap-1 active:scale-95 transition-all text-white cursor-pointer shadow-xs
              ${isSimulatingWalk 
                ? 'bg-amber-500 border-amber-400 hover:bg-amber-600' 
                : 'bg-teal-500 border-teal-400 hover:bg-teal-600'
              }`}
          >
            <RefreshCw className={`w-3 h-3 ${isSimulatingWalk ? 'animate-spin' : ''}`} />
            {isSimulatingWalk ? 'Stop Sim' : 'Weg simulieren'}
          </button>
        </div>

      </div>

      {/* Anzeige welche Kontakte den Standort sehen können */}
      <div className="space-y-2 mt-1" id="authorized-viewers-panel">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-teal-600 fill-teal-100" /> Wer sieht deinen Standort jetzt?
        </h3>

        {locationAuraContacts.length === 0 ? (
          <div className="text-center py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-xs">
            Keine Kontakte für Live-Ortung freigegeben. In den Kontaktdetails &quot;Ort live teilen&quot; anwählen.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5">
            <div className="flex flex-wrap gap-1.5">
              {locationAuraContacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className="bg-teal-50/70 border border-teal-100/60 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] text-teal-850 font-bold"
                >
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
                  <span className="truncate max-w-[100px]">{contact.name} ({contact.relation})</span>
                </div>
              ))}
            </div>
            <span className="text-[9.5px] text-slate-400 pl-1 leading-tight">These contacts get automatic updates inside the Live GPS Tracker.</span>
          </div>
        )}
      </div>

      {/* Safety info footer */}
      <div className="mt-4 p-3 bg-sky-50/40 rounded-xl border border-sky-100/60 flex items-start gap-2.5">
        <Smartphone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-left">
          <h4 className="text-[11px] font-bold text-slate-800">Gesicherte Hintergrund-Verfolgung</h4>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
            Deine Geodaten werden streng vertraulich nur an deine ausgewählten SafeRoute Kontakte übertragen. Nach Abschliessen des Heimweg-Modus erlischt der Zugriff umgehend.
          </p>
        </div>
      </div>

    </div>
  );
}
