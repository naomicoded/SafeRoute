/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EmergencyContact, UserProfile } from './types';
import { HomeView } from './components/HomeView';
import { ContactsView } from './components/ContactsView';
import { MapView } from './components/MapView';
import { WayHomeView } from './components/WayHomeView';
import { ProfileView } from './components/ProfileView';
import { SosView } from './components/SosView';
import { AuthViews } from './components/AuthViews';
import { PhoneShell } from './components/PhoneShell';
import { startEmergencySiren, stopEmergencySiren, playTick } from './utils/audio';
import { CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pre-defined demo users in system
const DEMO_USERS: UserProfile[] = [
  {
    firstName: 'Amina',
    lastName: 'Lehmann',
    email: 'aminah@saferoute.ch',
    phone: '+41 79 332 11 00',
    bloodType: 'A+',
    medicalNotes: 'Keine bekannten Allergien',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    fallDetection: true,
    stealthPin: '1991',
    alertOnTimerExpiry: true,
  }
];

// Prepopulated contacts for high fidelity demonstration
const INITIAL_DEMO_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact_1',
    name: 'Svenja (Beste Freundin)',
    phone: '+41 79 123 45 61',
    relation: 'Freundin',
    isTrusted: true,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'contact_2',
    name: 'Mama ❤️',
    phone: '+41 79 987 65 43',
    relation: 'Mutter',
    isTrusted: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  },
  {
    id: 'contact_3',
    name: 'Kristin (Schwester)',
    phone: '+41 76 567 43 21',
    relation: 'Schwester',
    isTrusted: false,
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
  },
];

interface LogEntry {
  id: string;
  time: string;
  type: 'sms' | 'call' | 'sensor' | 'system';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMuted, setIsMuted] = useState(false);

  // Authentication states
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const cached = localStorage.getItem('saferoute_users');
    return cached ? JSON.parse(cached) : DEMO_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('saferoute_current_user');
    return cached ? JSON.parse(cached) : null;
  });

  const isAuthenticated = currentUser !== null;

  // Sync users to storage
  useEffect(() => {
    localStorage.setItem('saferoute_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Sync current user to storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('saferoute_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('saferoute_current_user');
    }
  }, [currentUser]);

  // Contacts loaded for current authenticated user
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const cached = localStorage.getItem('saferoute_contacts');
    return cached ? JSON.parse(cached) : INITIAL_DEMO_CONTACTS;
  });

  useEffect(() => {
    localStorage.setItem('saferoute_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [userPos, setUserPos] = useState({ x: 25, y: 70 }); // Default relative coordinates

  // Alert State Controllers
  const [sosActive, setSosActive] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'monitoring' | 'danger'>('safe');
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(false);

  // Fall hazard and notifications
  const [fallCountdown, setFallCountdown] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [isSosOverlayOpen, setIsSosOverlayOpen] = useState(false);

  // Stealth PIN pop-ups
  const [pinInput, setPinInput] = useState('');
  const [showPinDeactivation, setShowPinDeactivation] = useState(false);

  // Preventative timers
  const [activeTimer, setActiveTimer] = useState({
    isActive: false,
    timeLeft: 0,
    totalTime: 0,
    destination: '',
  });

  const addLog = (type: 'sms' | 'call' | 'sensor' | 'system', message: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      time: timeStr,
      type,
      message,
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const addToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const showNotificationBanner = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification(null);
    }, 5500);
  };

  // Safe timer loop handler
  useEffect(() => {
    let interval: any;
    if (activeTimer.isActive && activeTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => {
          const nextTime = Math.max(0, prev.timeLeft - 1);
          if (nextTime === 0) {
            clearInterval(interval);
            handleTimerExpired();
          }
          return { ...prev, timeLeft: nextTime };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer.isActive, activeTimer.timeLeft]);

  const handleTimerExpired = () => {
    addLog('system', '⚠️ Sicherheits-Timer abgelaufen! Bestätigung wurde verlangt.');
    if (currentUser?.alertOnTimerExpiry) {
      triggerSos(false); 
    }
  };

  // Autologin default logs upon first authenticated start
  useEffect(() => {
    if (isAuthenticated && logs.length === 0) {
      addLog('system', `Ende-zu-Ende verschlüsselter Ortungsdienst initialisiert.`);
      addLog('system', `SafeRoute Begleiter für ${currentUser.firstName} aktiv.`);
    }
  }, [isAuthenticated]);

  const handleAddContact = (newContact: Omit<EmergencyContact, 'id'>) => {
    const contact: EmergencyContact = {
      ...newContact,
      id: `contact_${Date.now()}`,
    };
    setContacts((prev) => [...prev, contact]);
    addLog('system', `Kontakt hinzugefügt: ${contact.name} (${contact.relation})`);
  };

  const handleUpdateContact = (updated: EmergencyContact) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    addLog('system', `Kontakt updated: ${updated.name}`);
  };

  const handleDeleteContact = (id: string) => {
    const victim = contacts.find(c => c.id === id);
    setContacts((prev) => prev.filter(c => c.id !== id));
    if (victim) {
      addLog('system', `Kontakt gelöscht: ${victim.name}`);
    }
  };

  const handleSimulateCall = (name: string, phone: string) => {
    addLog('call', `Notruf-Direktwahl: Simuliere Telefonverbindung zu ${name} (${phone})`);
    addToast(`Wähle ${name}... 📞`);
    playTick();
  };

  const triggerSos = (silent: boolean = false) => {
    if (sosActive) return;

    setSosActive(true);
    setSafetyStatus('danger');
    addLog('sensor', '🚨 SOS-PANIK ALARM ausgelöst!');

    if (!silent && !isMuted) {
      startEmergencySiren();
    }

    // Auto location transmitter messages sent to active trackers
    const activeTrackers = contacts.filter(c => c.isTrusted);
    if (activeTrackers.length > 0) {
      activeTrackers.forEach((contact) => {
        const customSmsText = `Notfall-Tracker: ${currentUser?.firstName || 'Amina'} befürchtet Bedrohung! Live GPS: 47.3769 N, 8.5417 O. Bitte rufe mich an!`;
        addLog('sms', `Notfall-SMS an ${contact.name}: "${customSmsText}"`);
        showNotificationBanner(`SMS an ${contact.name} gesendet!`);
      });
    } else {
      addLog('system', 'Hinweis: Keine als vertrauenswürdig markierten Kontakte zum automatischen SMS-Senden hinterlegt.');
    }

    setIsSosOverlayOpen(true);
  };

  const deactivateSos = () => {
    setShowPinDeactivation(true);
    setPinInput('');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (pinInput === currentUser.stealthPin) {
      // Correct password
      setSosActive(false);
      setSafetyStatus(activeTimer.isActive ? 'monitoring' : 'safe');
      stopEmergencySiren();
      setShowPinDeactivation(false);
      setIsSosOverlayOpen(false);
      setPinInput('');
      addLog('system', `Sicherheitsalarm per PIN erfolgreich und legitimiert beendet.`);
      addToast('Alarm erfolgreich beendet! ✓');

      // Inform active circles
      const activeTrackers = contacts.filter(c => c.isTrusted);
      activeTrackers.forEach((contact) => {
        const entwarnungMsg = `Entwarnung! Mir geht es gut, ich habe den SafeRoute Alarm sicher beendet. Danke für deine Aufmerksamkeit!`;
        addLog('sms', `Entwarnungs-SMS an ${contact.name}`);
        showNotificationBanner(`Entwarnung-SMS gesendet.`);
      });
    } else {
      // Wrong PIN or stealth stress alarm: stops acoustics but rings secret sos in background!
      setSosActive(false);
      setSafetyStatus('danger');
      stopEmergencySiren();
      setShowPinDeactivation(false);
      setIsSosOverlayOpen(false);
      setPinInput('');

      addLog('sensor', `⚠️ FEHLERHAFTE PIN-EINGABE (${pinInput}) - Stiller Alarm aktiviert.`);
      
      const activeTrackers = contacts.filter(c => c.isTrusted);
      activeTrackers.forEach((contact) => {
        const panicMessage = `ACHTUNG! ${currentUser.firstName} Lehmann ist in Gefahr und hat einen erpressten Entschärfecode eingegeben. Rufe sofort Hilfe! GPS: 47.3769 N, 8.5417 O.`;
        addLog('sms', `STILLER SOS: SMS gesendet an ${contact.name}: "${panicMessage}"`);
        showNotificationBanner(`Heimlicher Bedrohungs-SOS gesendet!`);
      });

      addToast('PIN verarbeitet.');
    }
  };

  // Sensor fall activity simulation
  const handleTriggerFall = () => {
    if (fallCountdown !== null || sosActive) return;

    addLog('sensor', `💥 Plötzliche hochempfindliche Beschleunigungs-Erschütterung detektiert. Verletzungsgefahr erkannt!`);
    setFallCountdown(10);
    playTick();

    const interval = setInterval(() => {
      setFallCountdown((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev <= 1) {
          clearInterval(interval);
          triggerSos(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelFallAlert = () => {
    setFallCountdown(null);
    addLog('system', 'Sturz-Warnsignal manuell gelöscht.');
    addToast('Warnsignal aufgehoben.');
  };

  const handleStartWayHomeTimer = (minutes: number, destination: string) => {
    const seconds = minutes * 60;
    setActiveTimer({
      isActive: true,
      timeLeft: seconds,
      totalTime: seconds,
      destination,
    });
    setSafetyStatus('monitoring');
    setIsLocationSharingActive(true);
    addLog('system', `Wegebegleiter: Heimweg-Route nach "${destination}" gestartet. Zeitlimit: ${minutes}m`);

    // Inform trusted contacts
    const activeTrackers = contacts.filter(c => c.isTrusted);
    activeTrackers.forEach((contact) => {
      const startingMsg = `Ich gehe jetzt nach Hause (${destination}) und habe SafeRoute eingeschaltet. Folge mir auf Karte: http://saferoute.ch/live?user=${currentUser?.firstName.toLowerCase()}`;
      addLog('sms', `Heimweg-SMS gesendet an ${contact.name}: "${startingMsg}"`);
      showNotificationBanner(`Route an ${contact.name} gemeldet.`);
    });

    addToast('Heimweg gestartet! Live-Ortung läuft.');
  };

  const handleStopWayHomeTimer = (arrivedSafely: boolean) => {
    setActiveTimer({
      isActive: false,
      timeLeft: 0,
      totalTime: 0,
      destination: '',
    });
    setSafetyStatus('safe');
    setIsLocationSharingActive(false);

    if (arrivedSafely) {
      addLog('system', `Heimweg erfolgreich beendet: Sichere Ankunft am Zielort verzeichnet!`);
      addToast('Herzlichen Glückwunsch! Sichere Ankunft aufgezeichnet. 🎉');

      // Inform trusted contacts in checkin
      const activeTrackers = contacts.filter(c => c.isTrusted);
      activeTrackers.forEach((contact) => {
        const checkinMsg = `Ich bin sicher am Ziel angekommen. Danke fürs Aufpassen! ❤️`;
        addLog('sms', `Check-in SMS gesendet an ${contact.name}: "${checkinMsg}"`);
        showNotificationBanner(`Ankunft an ${contact.name} gemeldet.`);
      });
    } else {
      addLog('system', 'Sicherheits-Begleiter auf Wunsch des Nutzers beendet.');
    }
  };

  const handleExtendWayHomeTimer = (minutes: number) => {
    setActiveTimer((prev) => {
      const addedSec = minutes * 60;
      const nextTime = prev.timeLeft + addedSec;
      addLog('system', `Timer verlängert um +${minutes} Min. (Neues Limit: ${Math.floor(nextTime / 60)} Min)`);
      addToast(`Dauer um +${minutes}m verlängert`);
      return {
        ...prev,
        timeLeft: nextTime,
        totalTime: prev.totalTime + addedSec,
      };
    });
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    // Also sync in registered users list
    setRegisteredUsers((prev) => prev.map(u => u.email === updatedProfile.email ? updatedProfile : u));
    addLog('system', 'Persönliche Profildaten und Toggles erfolgreich gespeichert.');
  };

  const handlePurgeAllData = () => {
    localStorage.removeItem('saferoute_contacts');
    localStorage.removeItem('saferoute_profile');
    localStorage.removeItem('saferoute_current_user');
    setCurrentUser(null);
    setContacts(INITIAL_DEMO_CONTACTS);
    setLogs([]);
    setActiveTimer({ isActive: false, timeLeft: 0, totalTime: 0, destination: '' });
    setSosActive(false);
    setSafetyStatus('safe');
    setIsLocationSharingActive(false);
    stopEmergencySiren();
    setActiveTab('home');
    addToast('Sämtliche lokalen Registrierungsdaten wurden gelöscht.');
  };

  const handleRegisterSuccess = (newUser: UserProfile) => {
    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    stopEmergencySiren();
    setSosActive(false);
    setActiveTimer({ isActive: false, timeLeft: 0, totalTime: 0, destination: '' });
    setSafetyStatus('safe');
    setIsLocationSharingActive(false);
    addLog('system', 'Benutzer abgemeldet.');
  };

  // Mute siren toggle changes
  useEffect(() => {
    if (isMuted && sosActive) {
      stopEmergencySiren();
    } else if (!isMuted && sosActive) {
      startEmergencySiren();
    }
  }, [isMuted, sosActive]);

  const renderCurrentView = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'contacts':
        return (
          <ContactsView
            contacts={contacts}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            simulateCall={handleSimulateCall}
          />
        );
      case 'map':
        return (
          <MapView
            contacts={contacts}
            isLocationSharingActive={isLocationSharingActive}
            onToggleLocationSharing={(active) => {
              setIsLocationSharingActive(active);
              addLog('system', `Echtzeit-Standortübertragung ${active ? 'eingeschaltet' : 'ausgeschaltet'}.`);
            }}
            userPos={userPos}
            setUserPos={setUserPos}
          />
        );
      case 'timer':
        return (
          <WayHomeView
            contacts={contacts}
            profile={currentUser}
            activeTimer={activeTimer}
            onStartTimer={handleStartWayHomeTimer}
            onStopTimer={handleStopWayHomeTimer}
            onExtendTimer={handleExtendWayHomeTimer}
            triggerSos={triggerSos}
          />
        );
      case 'profile':
        return (
          <ProfileView
            profile={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onPurgeAllData={handlePurgeAllData}
            addToast={addToast}
            onNavigateToTab={setActiveTab}
          />
        );
      case 'home':
      default:
        return (
          <HomeView
            contacts={contacts}
            profile={currentUser}
            onSosClick={sosActive ? deactivateSos : () => setIsSosOverlayOpen(true)}
            sosActive={sosActive}
            safetyStatus={safetyStatus}
            simulateCall={handleSimulateCall}
            onNavigateToTab={setActiveTab}
            activeTimer={activeTimer}
            onStartTimer={handleStartWayHomeTimer}
            onStopTimer={handleStopWayHomeTimer}
            onExtendTimer={handleExtendWayHomeTimer}
            userPos={userPos}
            setUserPos={setUserPos}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen">
      
      {/* Phone mockup shell wrapper with companion system logging console */}
      <PhoneShell
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'sos') {
            setIsSosOverlayOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        logs={logs}
        onTriggerFall={handleTriggerFall}
        onClearLogs={() => setLogs([])}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        activeNotification={activeNotification}
        onCloseNotification={() => setActiveNotification(null)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      >
        {!isAuthenticated ? (
          /* Authentication Screen (Welcome, SignUp, Login) */
          <AuthViews
            onLoginSuccess={handleLoginSuccess}
            initialUsers={registeredUsers}
            onAddUser={handleRegisterSuccess}
            onAddLog={addLog}
          />
        ) : (
          /* Live Authenticated View Render */
          renderCurrentView()
        )}

        {/* IN-PHONE APP PORT TOAST NOTIFICATION */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 left-4 right-4 z-40 bg-slate-900 text-white border border-slate-800 text-xs py-2 px-2.5 rounded-xl font-semibold tracking-wide shadow-md flex items-center justify-center gap-1 leading-none"
            >
              <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHYSICAL FALL COLLISION EMERGENCY COUNTDOWN SHEET */}
        <AnimatePresence>
          {fallCountdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/95 text-white flex flex-col items-center justify-center p-6 text-center rounded-3xl"
              id="fall-countdown-overlay"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>

              <h3 className="text-lg font-black tracking-tight">Erschütterung registriert!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-[210px] leading-relaxed">
                Wir senden deinen automatischen Notfall-SOS in:
              </p>

              <div className="text-6xl font-black font-mono text-rose-500 my-5 animate-pulse">
                {fallCountdown}
              </div>

              <button
                onClick={cancelFallAlert}
                id="btn-cancel-fall"
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-sky-505 bg-gradient-to-r from-teal-500 to-sky-500 text-slate-900 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Mir geht&apos;s gut – Abbrechen
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEALTH DEACTIVATION KEY BOARD OVERLAY (STRESS DEACTIVATION FOR INTENSIFIED THREATS) */}
        <AnimatePresence>
          {showPinDeactivation && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-x-0 bottom-0 top-10 z-50 bg-slate-900 rounded-t-3xl border-t border-slate-800 p-6 flex flex-col justify-between text-white"
              id="pin-auth-overlay"
            >
              <div className="flex justify-between items-center text-left">
                <div>
                  <h3 className="text-sm font-black text-white uppercase font-mono tracking-tight">Alarm abschalten</h3>
                  <p className="text-[10px] text-slate-400">PIN-Eingabe erforderlich</p>
                </div>
                <button
                  onClick={() => setShowPinDeactivation(false)}
                  className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold"
                >
                  Abbrechen
                </button>
              </div>

              {/* Pin representation dots */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="flex gap-4 mb-6">
                  {[0, 1, 2, 3].map((dotIdx) => (
                    <div
                      key={dotIdx}
                      className={`w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                        pinInput.length > dotIdx 
                          ? 'bg-teal-500 border-teal-500' 
                          : 'bg-transparent border-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <form onSubmit={handlePinSubmit} className="w-full max-w-[170px]">
                  <input
                    type="password"
                    maxLength={4}
                    pattern="[0-9]*"
                    autoFocus
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 text-center font-mono text-2xl tracking-widest text-white outline-none focus:border-teal-500"
                    required
                  />
                  
                  <button
                    type="submit"
                    className="w-full py-2 mt-4 rounded-xl bg-teal-500 text-slate-950 font-black text-xs hover:bg-teal-400 cursor-pointer text-center"
                  >
                    Identität bestätigen
                  </button>
                </form>
              </div>

              <div className="p-3 bg-teal-950/20 rounded-xl text-center border border-teal-900/40">
                <span className="text-[9.5px] text-teal-400 block leading-normal">
                  Hinweis: Durch einen falschen Bedrohungscode schaltet sich der Sirenenlärm ab, sendet jedoch unbemerkt sofort SOS an Helfer!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS VIEW OVERLAY PAGE SCREEN */}
        <AnimatePresence>
          {isSosOverlayOpen && currentUser && (
            <SosView
              contacts={contacts}
              profile={currentUser}
              sosActive={sosActive}
              onActivateSos={triggerSos}
              onDeactivateSos={deactivateSos}
              onAddLog={addLog}
              onShowNotification={showNotificationBanner}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              onClose={() => setIsSosOverlayOpen(false)}
            />
          )}
        </AnimatePresence>

      </PhoneShell>
    </div>
  );
}
