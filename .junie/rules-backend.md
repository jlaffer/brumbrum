# Backend Guidelines

Specific rules for the BrumBrum Nest.js backend.

## Tech Stack (Backend)
- Nest.js (Modular architecture)
- TypeORM for SQLite persistence
- Socket.io for real-time updates
- Nodemailer for email notifications
- Node.js fetch for CallMeBot (WhatsApp)

## Development Rules
- **ESM Modules:** Ensure all local imports include the `.js` extension (e.g., `import { User } from './entities.js'`).
- **Data Integrity:** Always use TypeORM relations when fetching entities that are used in notifications or complex UI rendering (e.g., `car.owner`).
- **Real-time Sync:** Every mutation (Create, Update, Delete) MUST call the corresponding `notify` method in `AppGateway` to sync all connected clients.
- **Service Layer:** Keep business logic in Services; Controllers should only handle routing and basic validation.
- **Configuration:** Use `src/config/` for external service settings (like SMTP).

## Common Tasks
- Adding a new entity: Define in `src/entities/entities.ts` and update `AppModule` providers.
- Updating notifications: Modify `NotificationService`.
