<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# SafeRoute

Prototyp für ÜK248.

## Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6d65004d-39df-4a8a-843f-fbd37f49d81a

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install


# SafeRoute – Technische Dokumentation

Diese Dokumentation beschreibt die technischen Voraussetzungen, die Installation, den Start, die Tests sowie die wichtigsten Funktionen und Technologien der SafeRoute-App.

## 1. Setup: Voraussetzungen und Schritt-für-Schritt-Installation

### 1.1 Voraussetzungen

Damit SafeRoute auf einer fremden Umgebung gestartet werden kann, müssen folgende Programme installiert sein:

#### Benötigte Software

| Software | Zweck |
|---|---|
| Visual Studio Code | Code bearbeiten und Projekt starten |
| Node.js LTS | React-Projekt lokal ausführen |
| npm | Packages installieren und Startbefehle ausführen |
| Git | Projektverwaltung |

#### Benötigte Accounts

Für die echten APIs werden zusätzlich folgende Accounts benötigt:

| Account | Zweck |
|---|---|
| Supabase | Datenbank für gemeldete unsichere Orte |
| OpenRouteService | Geocoding und Fussgänger-Routing |
| Google Cloud | Google Maps Karte |

### 1.2 Programme installieren

#### Schritt 1: Visual Studio Code installieren

Visual Studio Code herunterladen und installieren.

Nach der Installation VS Code öffnen und folgende Extensions installieren:

- ESLint
- Prettier
- JavaScript and TypeScript Nightly, optional
- ES7+ React/Redux/React-Native snippets, optional

#### Schritt 2: Node.js installieren

Node.js LTS herunterladen und installieren.

Nach der Installation ein Terminal öffnen und prüfen:

```bash
node --version
npm --version
```

Wenn beide Befehle eine Versionsnummer anzeigen, ist Node.js korrekt installiert.

#### Schritt 3: Git installieren

Git herunterladen und installieren.

Danach im Terminal prüfen:

```bash
git --version
```

Wenn eine Versionsnummer angezeigt wird, ist Git korrekt installiert.

### 1.3 Projekt öffnen

Das Projekt sollte nicht in einem temporären Ordner liegen.

Empfohlener Speicherort:

```text
C:\Users\<Benutzername>\Documents\saferoute
```

In den Projektordner wechseln und Projekt öffnen:

```bash
cd "C:\Users\<Benutzername>\Documents\saferoute"
```

### 1.4 Projekt-Abhängigkeiten installieren

Im Projektordner ausführen:

```bash
npm install
```

Dadurch werden alle Packages aus der Datei `package.json` installiert.

Falls die API-Packages noch fehlen, diese zusätzlich installieren:

```bash
npm install @supabase/supabase-js @googlemaps/js-api-loader
```

### 1.5 Environment-Datei erstellen

Im Hauptordner des Projekts eine Datei erstellen:

```text
.env.local
```

Inhalt:

```env
VITE_GOOGLE_MAPS_API_KEY=HIER_GOOGLE_MAPS_API_KEY_EINTRAGEN
VITE_MAPBOX_ACCESS_TOKEN=HIER_MAPBOX_TOKEN_EINTRAGEN
VITE_SUPABASE_URL=HIER_SUPABASE_PROJECT_URL_EINTRAGEN
VITE_SUPABASE_ANON_KEY=HIER_SUPABASE_ANON_KEY_EINTRAGEN
```

Wichtig:

- Die Datei `.env.local` soll nicht öffentlich hochgeladen werden, da sie API-Keys enthält.

### 1.6 Supabase-Datenbank vorbereiten

In Supabase ein Projekt erstellen oder ein bestehendes Projekt öffnen.

Danach folgende Schritte ausführen:

1. Supabase Dashboard öffnen
2. Projekt auswählen
3. Links auf **SQL Editor** klicken
4. **New Query** auswählen
5. Folgendes SQL einfügen:

```sql
create table if not exists safety_reports (
  id uuid primary key default gen_random_uuid(),
  latitude double precision not null,
  longitude double precision not null,
  category text not null,
  description text,
  severity int not null default 1,
  created_at timestamp with time zone default now()
);

alter table safety_reports enable row level security;

create policy "Anyone can read safety reports"
on safety_reports
for select
using (true);

create policy "Anyone can insert safety reports"
on safety_reports
for insert
with check (
  category in ('dark_area', 'harassment', 'isolated_area', 'bad_lighting', 'other')
  and severity between 1 and 5
);
```

6. Auf **Run** klicken

Danach unter **Project Settings** > **API** folgende Werte kopieren:

- Project URL
- Anon Key / Public Key

Diese Werte in `.env.local` eintragen.

### 1.7 Google Maps API Key vorbereiten

Für die Kartenansicht wird ein Google Maps API Key benötigt.

In Google Cloud:

1. Projekt erstellen oder bestehendes Projekt öffnen
2. Billing aktivieren
3. **APIs & Services** öffnen
4. **Library** öffnen
5. **Maps JavaScript API** aktivieren
6. API Key erstellen
7. API Key in `.env.local` eintragen

### 1.8 OpenRouteService API vorbereiten

Für Adresssuche und Routing wird ein OpenRouteService API Key benötigt.

In OpenRouteService:

1. Account erstellen oder einloggen
2. API Key kopieren
3. API Key in `.env.local` eintragen

## 2. Start und Test: Anwendung starten und prüfen

### 2.1 Anwendung lokal starten

Im Projektordner ausführen:

```bash
npm run dev
```

Danach zeigt das Terminal eine lokale URL an, zum Beispiel:

```text
http://localhost:5173/
```

Diese URL im Browser öffnen.

### 2.2 Anwendung bauen

Zum Prüfen, ob das Projekt technisch korrekt gebaut werden kann:

```bash
npm run build
```

Wenn der Build erfolgreich ist, wurde die Produktionsversion der App erstellt.

### 2.3 Anwendung testen

#### Test 1: Startseite

Aktion:

- App im Browser öffnen.

Erwartung:

- App wird angezeigt.
- Die App lädt ohne Fehlermeldung.

#### Test 2: Adresseingabe

Beispieldaten:

- Start: Zürich HB
- Ziel: Bellevue Zürich

Erwartung:

- Die Eingaben können erfasst werden.
- Die App erkennt Start und Ziel als Orte in Zürich.

#### Test 3: Karte

Erwartung:

- Google Maps Karte wird angezeigt.
- Die Karte ist auf Zürich zentriert.
- Es erscheint kein leerer oder grauer Kartenbereich.

#### Test 4: Routing

Erwartung:

- Eine Fussgängerroute wird berechnet.
- Die Route wird auf der Karte angezeigt.
- Falls mehrere Routen vorhanden sind, kann die sicherste Route hervorgehoben werden.

#### Test 5: Supabase

Aktion:

- Einen unsicheren Ort melden.
- Danach in Supabase die Tabelle `safety_reports` öffnen.

Erwartung:

- Die neue Meldung erscheint in der Datenbank.
- Felder wie Kategorie, Beschreibung, Schweregrad und Koordinaten sind gespeichert.

## 3. Funktionsüberblick

### 3.1 Start- und Zielsuche

Nutzerinnen und Nutzer können einen Startpunkt und ein Ziel eingeben.

Beispiel:

- Start: Zürich HB
- Ziel: Bellevue Zürich

Die Eingaben werden über OpenRouteService Geocoding in Koordinaten umgewandelt.

### 3.2 Kartenansicht

Die App zeigt eine Karte von Zürich an.

Die Karte dient dazu:

- Startpunkt anzuzeigen
- Zielpunkt anzuzeigen
- Route sichtbar zu machen

### 3.3 Sichere Route berechnen

SafeRoute berechnet nicht nur die schnellste Route, sondern bewertet Routen zusätzlich anhand von Sicherheitsfaktoren.

Berücksichtigte Faktoren:

- gut beleuchtete Wege
- Nähe zu ÖV-Haltestellen
- Nähe zu belebten Orten
- Nähe zu Shops, Cafés oder Restaurants
- Nähe zu Polizei oder sicherheitsrelevanten Orten
- gemeldete unsichere Orte

Die sicherste Route kann dadurch etwas länger sein als die schnellste Route.

### 3.4 Sicherheitsdaten aus OpenStreetMap

Über die Overpass API werden sicherheitsrelevante OpenStreetMap-Daten abgefragt.

Verwendete Daten:

- beleuchtete Wege
- Bus- und Tramhaltestellen
- ÖV-Plattformen
- Shops
- Cafés
- Restaurants
- Bars
- Polizei-Standorte

Diese Daten werden als Hinweise verwendet, um Routen sicherer einzuschätzen.

## 4. Tech-Stack und Struktur

### 4.1 Verwendete Technologien

| Bereich | Technologie |
|---|---|
| Frontend | React |
| Entwicklungsumgebung | Visual Studio Code |
| Karte | Google Maps API |
| Routing | OpenRouteService API |
| Geocoding | OpenRouteService API |
| Sicherheitsdaten | Overpass API / OpenStreetMap |
| Datenbank | Supabase |

### 4.2 Grobe Projektstruktur

```text
saferoute/
├── public/
├── src/
│   ├── components/
│   ├── App.tsx
│   └── main.tsx
├── .env.local
├── package.json
└── README.md
```

### 4.3 Erklärung der wichtigsten Dateien

| Datei / Ordner | Aufgabe |
|---|---|
| `package.json` | Enthält Projektinformationen, Scripts und Dependencies |
| `.env.local` | Enthält lokale API-Keys |
| `.env.example` | Vorlage für benötigte Environment-Variablen |
| `App.tsx` | Hauptkomponente der App |
| `main.tsx` | Einstiegspunkt der React-App |
| `src/components/` | Wiederverwendbare UI-Komponenten |
| `README.md` | Technische Dokumentation |

### 4.4 Entwicklungsreihenfolge

Die Entwicklung wurde oder wird in folgenden Schritten aufgebaut:

1. React-Projekt aus Google AI Studio nach VS Code übernommen
2. Projekt mit `npm install` installiert
3. lokale Entwicklungsumgebung mit `npm run dev` gestartet
4. `.env.local` für API-Keys erstellt
5. Supabase-Datenbank eingerichtet
6. Supabase-Client in React verbunden
7. Google Maps Karte eingebunden
8. OpenRouteService Geocoding für Adresssuche ergänzt
9. OpenRouteService für Fussgänger-Routing ergänzt
10. Overpass API für Sicherheitsdaten ergänzt
11. Safety Scoring für sichere Routenlogik ergänzt
12. README und technische Dokumentation erstellt

### 4.5 Terminal-Befehle im Überblick

Projekt installieren:

```bash
npm install
```

App lokal starten:

```bash
npm run dev
```

App bauen:

```bash
npm run build
```

Build lokal ansehen, falls Vite verwendet wird:

```bash
npm run preview
```

### 4.6 Hinweise für den Coach

Zum Testen der App:

1. Projekt in VS Code öffnen.
2. `.env.local` mit API-Keys erstellen.
3. Im Terminal ausführen:

```bash
npm install
npm run dev
```

4. Lokale URL im Browser öffnen.
5. Folgende Testdaten verwenden:

- Start: Zürich HB
- Ziel: Bellevue Zürich

6. Prüfen:

- Startseite sichtbar
- Karte sichtbar
- Route wird berechnet
- Sicherheitsinformationen werden angezeigt
- Meldung kann gespeichert werden
- Meldung erscheint in Supabase

Falls API-Keys fehlen, soll die App im Demo-Modus weiterlaufen.
