# Architektur & Datenfluss - BrumBrum

## Übersicht
Das Projekt ist als Monorepo mit zwei Hauptverzeichnissen strukturiert: `backend` und `frontend`.

## Datenmodell
Zentrales Modell in `backend/src/entities/entities.ts`:
- **User:** Repräsentiert einen Nachbarn (Name, Farbe).
- **Car:** Ein Fahrzeug mit Besitzer (User), Marke, Modell, Kilometerstand.
- **Reservation:** Verknüpft User und Car. Hat einen Zeitraum und einen Status (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`).

## Kommunikation
1. **REST API:** Für Standard-CRUD-Operationen (Erstellen von Reservierungen, Bearbeiten von Nachbarn).
2. **WebSockets (Socket.io):** 
   - Das Backend sendet Broadcasts, wenn sich Daten ändern (z.B. `reservationsUpdated`, `carsUpdated`).
   - Das Frontend hört auf diese Events und aktualisiert die lokale Anzeige sofort, ohne die Seite neu zu laden.

## Kalender-Integration
- Das Backend bietet einen Endpunkt `/calendar/ics`, der alle aktiven Reservierungen im Standard-ICS-Format exportiert.
- Der Link kann in externe Kalender-Apps (Google, Outlook) eingebunden werden.

## Wichtige Logik-Punkte
- **Reservierungs-Status:** Wenn eine Reservierung bearbeitet wird, wird ihr Status automatisch auf `PENDING` zurückgesetzt, damit der Besitzer sie erneut bestätigen muss.
- **Kilometerstand:** Nach Abschluss einer Fahrt (`COMPLETED`) wird der Kilometerstand des Fahrzeugs automatisch im Backend aktualisiert.
