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
- **WhatsApp-Benachrichtigungen:** Via CallMeBot API.

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
Dieses Projekt folgt einer hierarchischen Struktur für KI-Anweisungen:
1. **Global:** Allgemeine Projektregeln in dieser Datei (`AGENTS.md`).
2. **Backend:** Spezifische Nest.js & ESM Regeln in `.junie/rules-backend.md`.
3. **Frontend:** Spezifische Vue.js & UI Regeln in `.junie/rules-frontend.md`.

### Allgemeine Regeln
- **Code-Stil:** Halte dich strikt an die bestehende Struktur und Benennungskonventionen.
- **Sprache:** Kommentare und Dokumentation (KDoc/JSDoc) sollten in der Sprache des Nutzers oder auf Englisch verfasst sein.
- **Benachrichtigungen:** Benachrichtigungen erfolgen über den `NotificationService`. Nutzer müssen ihren CallMeBot API-Key hinterlegen.

## Dokumentation
- [Tech Stack Details](tech-stack.md)
- [Architektur & Datenfluss](architecture.md)
- [Backend Richtlinien](rules-backend.md)
- [Frontend Richtlinien](rules-frontend.md)
