/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Compass } from 'lucide-react';

interface InteractiveMapProps {
  userPos: { x: number; y: number };
  onMapClick?: (x: number, y: number) => void;
  showRouteTo?: string | null;
  isSimulatingWalk?: boolean;
}

export function InteractiveMap({
  userPos,
  onMapClick,
  showRouteTo,
  isSimulatingWalk = false,
}: InteractiveMapProps) {

  // Simulated street lines (0 to 100 percentage layout)
  const streets = [
    { name: 'Seestrasse', x1: 5, y1: 25, x2: 95, y2: 25 },
    { name: 'Bahnhofstrasse', x1: 25, y1: 5, x2: 25, y2: 95 },
    { name: 'Limmatweg', x1: 5, y1: 65, x2: 95, y2: 65 },
    { name: 'Postgasse', x1: 65, y1: 25, x2: 65, y2: 95 },
  ];

  // Map landmarks
  const landmarks = [
    { id: 'police_1', name: 'Polizeiposten Central', type: 'police', x: 25, y: 15, details: '24h Besetzt' },
    { id: 'safe_1', name: 'Kiosk Central (SafeZone)', type: 'safe_zone', x: 65, y: 50, details: 'Zertifizierter Schutzraum' },
    { id: 'safe_2', name: 'Restaurant Ochsen', type: 'safe_zone', x: 25, y: 80, details: 'Sicherer Zufluchtsort' },
  ];

  // Route paths mapped for preset destinations to render clean vectors
  const getRoutePath = () => {
    if (!showRouteTo) return null;
    
    // Default walk simulation path
    return [
      { x: userPos.x, y: userPos.y },
      { x: 25, y: 65 },
      { x: 45, y: 65 },
      { x: 65, y: 65 },
      { x: 65, y: 25 },
      { x: 80, y: 25 },
    ];
  };

  const routePath = getRoutePath();

  const handleMapClickInternal = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onMapClick(Math.round(x), Math.round(y));
  };

  return (
    <div className="relative w-full h-full bg-[#f8fafc] overflow-hidden rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      
      {/* Dynamic SVG Vector Map */}
      <svg
        className="absolute inset-0 w-full h-full select-none cursor-crosshair bg-[#fbfdfb]"
        onClick={handleMapClickInternal}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Decorative Green Parks */}
        <rect x="5" y="5" width="16" height="15" className="fill-emerald-100/50 rounded-lg" />
        <rect x="75" y="45" width="20" height="15" className="fill-emerald-100/40 rounded-lg" />
        <circle cx="85" cy="85" r="10" className="fill-emerald-50/50" />

        {/* Dynamic coordinate lines grid (light and responsive) */}
        <g opacity="0.08">
          {[20, 40, 60, 80].map((coord) => (
            <React.Fragment key={coord}>
              <line x1="0" y1={coord} x2="100" y2={coord} stroke="#000" strokeWidth="0.1" />
              <line x1={coord} y1="0" x2={coord} y2="100" stroke="#000" strokeWidth="0.1" />
            </React.Fragment>
          ))}
        </g>

        {/* Streets Renderer */}
        {streets.map((st, idx) => (
          <g key={idx}>
            <line
              x1={st.x1}
              y1={st.y1}
              x2={st.x2}
              y2={st.y2}
              className="stroke-slate-100 stroke-[5] stroke-linecap-round"
            />
            <line
              x1={st.x1}
              y1={st.y1}
              x2={st.x2}
              y2={st.y2}
              className="stroke-white stroke-[3.6] stroke-linecap-round"
            />
          </g>
        ))}

        {/* Labels */}
        <text x="28" y="45" className="fill-slate-350 font-sans text-[2px] font-bold transform rotate-90 origin-[28px_45px] tracking-widest uppercase">Bahnhofstrasse</text>
        <text x="45" y="23" className="fill-slate-350 font-sans text-[1.8px] font-bold tracking-widest uppercase">Seestrasse</text>
        <text x="45" y="63" className="fill-slate-350 font-sans text-[1.8px] font-bold tracking-widest uppercase">Limmatweg</text>

        {/* Highlighted safe route to current destination */}
        {routePath && (
          <polyline
            points={routePath.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#14b8a6" // Turquoise color identity
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />
        )}

        {/* Safe points and Police Landmarks */}
        {landmarks.map((mk) => {
          const isPolice = mk.type === 'police';
          const color = isPolice ? 'fill-rose-500' : 'fill-teal-500';
          const bgCircle = isPolice ? 'fill-rose-100/50' : 'fill-teal-100/50';

          return (
            <g key={mk.id}>
              <circle cx={mk.x} cy={mk.y} r="3.2" className={`${bgCircle} stroke-${isPolice ? 'rose' : 'teal'}-200 stroke-[0.1]`} />
              <circle cx={mk.x} cy={mk.y} r="1.2" className={`${color}`} />
            </g>
          );
        })}

        {/* Live User coordinates marker dot with ping waves */}
        <g>
          <circle cx={userPos.x} cy={userPos.y} r="5.5" className="fill-sky-100/60 stroke-sky-300 stroke-[0.1]" />
          <circle cx={userPos.x} cy={userPos.y} r="2.2" className="fill-sky-400/35 stroke-teal-300/80 stroke-[0.3] animate-ping" />
          <circle cx={userPos.x} cy={userPos.y} r="1.4" className="fill-sky-500" />
          <circle cx={userPos.x} cy={userPos.y} r="0.5" className="fill-white" />
        </g>
      </svg>

      {/* Floating GPS and Precision Badges (always responsive inside iframe container) */}
      <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs border border-slate-100 px-2.5 py-1 rounded-lg text-[8px] text-slate-700 font-mono font-black shadow-sm flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5 text-sky-500 shrink-0" />
          <span>Zürich Hauptbahnhof</span>
        </div>
        
        <div className="bg-white/95 backdrop-blur-xs border border-slate-100 px-2.5 py-1 rounded-lg text-[8px] text-teal-700 font-mono font-black shadow-sm flex items-center gap-1">
          <Compass className="w-2.5 h-2.5 text-teal-500 animate-spin-slow" />
          <span>Sicherheits-Route aktiv</span>
        </div>
      </div>
    </div>
  );
}
