# BrumBrum Projekt-Guidelines

Diese Datei dient als Gedächtnis und Regelwerk für die KI-gestützte Entwicklung des Projekts "BrumBrum".

## Projekt-Übersicht
BrumBrum ist eine private Carsharing-Plattform für Nachbarn. Sie ermöglicht die Verwaltung von Fahrzeugen, Reservierungen und Kilometerständen in Echtzeit.

## Tech-Stack
- **Backend:** Nest.js (TypeScript), TypeORM mit SQLite (`better-sqlite3`).
- **Frontend:** Vue.js 3 (Composition API, TypeScript), Vite.
- **UI-Library:** Ant Design Vue (antdv).
- **Kommunikation:** REST API & WebSockets (Socket.io) für Echtzeit-Updates.
- **Kalender-Export:** iCalendar (.ics) Format via `ics` Bibliothek.

## Projektstruktur
- `/backend`: Nest.js Anwendung.
  - `src/entities/entities.ts`: Zentrale Datenmodelle.
  - `src/gateways/app.gateway.ts`: WebSocket-Logik.
- `/frontend`: Vue.js Anwendung.
  - `src/api/index.ts`: API-Client.
  - `src/views/`: Hauptseiten (Home, Reservations, MyCars, Neighbors).

## Entwicklungs-Befehle
| Task | Kommando (im jeweiligen Verzeichnis) |
| :--- | :--- |
| Installation | `npm install` |
| Backend Start | `npm run start:dev` |
| Frontend Start | `npm run dev` |
| Build (BE/FE) | `npm run build` |

## Regeln für die KI
- **Code-Stil:** Halte dich strikt an die bestehende Struktur und Benennungskonventionen.
- **Sprache:** Kommentare und Dokumentation (KDoc/JSDoc) sollten in der Sprache des Nutzers oder auf Englisch verfasst sein, passend zum Kontext.
- **Fehlerbehandlung:** Implementiere defensive Programmierung (z.B. Optional Chaining im Frontend).
- **Echtzeit:** Bei Änderungen an Daten im Backend muss die `AppGateway` Methode zur Benachrichtigung (`notify...`) aufgerufen werden.
- **Responsivität:** Alle UI-Änderungen müssen mobilfreundlich sein (Ant Design Grid, Media Queries).

## Dokumentation
- Siehe `.junie/tech-stack.md` für detaillierte Abhängigkeiten.
- Siehe `.junie/architecture.md` für den Datenfluss.
