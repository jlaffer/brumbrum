# Frontend Guidelines

Specific rules for the BrumBrum Vue.js 3 frontend.

## Tech Stack (Frontend)
- Vue.js 3 (Composition API)
- TypeScript
- Ant Design Vue (UI Components)
- Vite (Build tool)
- Socket.io-client (Real-time)
- Day.js (Date handling)

## Development Rules
- **Type Safety:** Use `import type` for interfaces from `@shared/types` or `src/types/index.ts` to avoid runtime syntax errors.
- **Import Extensions:** Do NOT use `.js` or `.ts` extensions for frontend imports (Vite handles resolution).
- **Responsivity:** 
  - Use `a-row` and `a-col` for grid layouts.
  - Implement mobile-first logic using the `isDesktop` ref (usually based on `window.innerWidth`).
  - Use `a-drawer` for mobile navigation and `a-table` with scroll/card fallback for mobile lists.
- **Branding:** 
  - Primary color is `#337a19`.
  - Global font is `Montserrat`, headers use `Fascinate`.
- **Defensive Programming:** Always use optional chaining (`?.`) when accessing nested properties like `record.car?.owner?.name`.

## Common Tasks
- Adding a View: Create in `src/views/`, update `src/router/index.ts`, and add to `App.vue` navigation.
- UI Consistency: Use `a-config-provider` for theme tokens.
