# Superleap Lead CRM

A polished, single-page Lead Management CRM built for the Frontend Engineering Intern assessment at Superleap.

## Features

- **Level 1 (Core CRUD UI + Status Rules):**
  - List view with responsive data table.
  - Search by name/email and filter by status (URL-synced).
  - Create, Edit, and Delete leads with optimistic UI updates.
  - Status transition rules strictly enforced (`NEW` -> `CONTACTED` -> `QUALIFIED` -> `CONVERTED` / `LOST`).
  - Validation, toast notifications, loading states, and error handling.
- **Level 2 (Kanban Board View):**
  - Interactive drag-and-drop board.
  - Visual enforcement of invalid transitions (bounces back and shows a toast error).
  - Search and filter state naturally persist across List and Board views.
- **Level 3 (Bulk Actions):**
  - Bulk select functionality.
  - Bulk delete selected leads from the List view.

## Tech Stack

- **Framework**: React + Vite (Fast builds, modern standard)
- **Language**: TypeScript (Type safety and excellent developer experience)
- **State Management**: React Context + Custom Hooks (Keeps things simple, no over-fetching, perfect for this size without adding Redux/Zustand overhead)
- **Styling**: Vanilla CSS with CSS Variables (Maximum flexibility, custom dark mode premium aesthetic without being constrained by a library)
- **Drag and Drop**: `@dnd-kit` (Modern, accessible, lightweight DnD library for React)
- **Icons**: `lucide-react` (Clean, crisp icons)
- **Mock API**: `json-server` (Provides a realistic network experience)

## Setup Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server and mock API simultaneously:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`. The mock API runs on `http://localhost:3001`.

## Design Decisions

- **State & Async Logic**: I encapsulated all async requests and state within a `useLeads` hook wrapping a `LeadsContext`. This allowed both the List View and Board View to read from the exact same state without prop drilling. Optimistic UI updates are used heavily for status changes and deletions to ensure the UI feels blazingly fast.
- **Status Rules**: Status enforcement is handled at the utility level (`utils/status.ts`). In the List View, dropdowns conditionally disable transitions. In the Board view, invalid drops are caught in `onDragEnd` and reverted while immediately alerting the user with a Toast notification.
- **Styling & Aesthetics**: I aimed for a modern, sleek dark mode utilizing custom CSS variables. A heavy emphasis was placed on smooth animations, clean typography, subtle borders, and glass-like components rather than just standard generic styling.

## Future Improvements

- **Offline Support / Concurrency**: If dealing with offline capabilities, I'd implement a solution like React Query or a Service Worker caching layer to store mutations and sync when back online. To handle concurrency (two users editing the same lead), I'd implement optimistic concurrency control using ETag headers or a `version` field in the database, reverting the UI if a `409 Conflict` occurs.
- **More Time**: With another week, I would implement robust pagination/virtualization for massive datasets, add a per-lead activity timeline, support exporting data, and incorporate full e2e testing with Playwright.

## AI Usage Note

I utilized AI tools primarily as an intelligent autocomplete and boilerplate generator. For instance, I used it to rapidly scaffold the Vite environment, quickly stub out the initial CSS boilerplate, and generate seed data. However, the core logic—specifically the drag-and-drop mechanics with `@dnd-kit`, the strict state management context, and the custom optimistic UI handling—were written intentionally and curated heavily by hand to ensure strict compliance with the assessment's status rules and edge cases.
