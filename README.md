# BrumBrum - Private Carsharing

Dieses Projekt ist eine einfache Carsharing-Plattform für Nachbarn.

## Features
- Übersicht über verfügbare Fahrzeuge (Listen- und Kalenderansicht)
- Reservierung von Fahrzeugen
- Verwaltung eigener Fahrzeuge
- Bestätigung/Ablehnung von Reservierungsanfragen (für Besitzer)
- Eintragung des Kilometerstands nach der Fahrt
- Echtzeit-Updates via WebSockets

## Technologien
- **Backend:** Nest.js, SQLite (better-sqlite3), TypeORM
- **Frontend:** Vue.js 3, TypeScript, Ant Design Vue, Vite
- **Kommunikation:** REST & Socket.io

## Installation & Start

### Voraussetzungen
- Node.js (v22+)
- npm oder yarn

### Monorepo-Struktur
Das Projekt ist in `backend` und `frontend` unterteilt.

### Starten

1. **Backend:**
   ```bash
   cd backend
   yarn install --ignore-engines
   npm run start
   ```

2. **Frontend:**
   ```bash
   cd frontend
   yarn install --ignore-engines
   npm run dev
   ```

Das Backend läuft auf `http://localhost:3000`, das Frontend auf `http://localhost:5173`.
Beim ersten Start werden automatisch zwei Testbenutzer ("Nachbar A" und "Nachbar B") angelegt.
Oben rechts im Frontend kann zwischen den Benutzern gewechselt werden.

## KI-Unterstützung (Junie & Co.)
Dieses Projekt enthält spezielle Richtlinien für KIs im Verzeichnis `.junie/`.
- `AGENTS.md`: Haupt-Guidelines und Projektgedächtnis.
- `tech-stack.md`: Details zum technologischen Stack.
- `architecture.md`: Dokumentation der Architektur und des Datenflusses.
