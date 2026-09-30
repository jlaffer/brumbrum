# Technischer Stack - BrumBrum

## Backend (Nest.js)
- **Framework:** Nest.js v10+
- **ORM:** TypeORM
- **Datenbank:** SQLite via `better-sqlite3`
- **Echtzeit:** `@nestjs/websockets` & `socket.io`
- **Besonderheiten:** 
  - ESM (EcmaScript Modules) Konfiguration (`"type": "module"`).
  - Imports benötigen im Backend oft die `.js` Endung.
  - Generierung von `.ics` Dateien mit der `ics` Bibliothek.

## Frontend (Vue.js)
- **Framework:** Vue 3 (Composition API)
- **Build-Tool:** Vite
- **Sprache:** TypeScript
- **UI-Komponenten:** Ant Design Vue (Antdv)
- **Icons:** `@ant-design/icons-vue`
- **Routing:** Vue Router
- **Echtzeit:** `socket.io-client`

## Gemeinsame Typisierung
- Die Typen im Frontend (`frontend/src/types/index.ts`) sollten mit den Entitäten im Backend (`backend/src/entities/entities.ts`) synchron gehalten werden.
- Frontend verwendet `import type` für Interfaces, um Laufzeitfehler zu vermeiden.
