# Multi-View Project Tracker

A fully functional project management frontend built for the Velozity Global Solutions Front End Developer Technical Hiring Assessment. Implements three data views with a custom drag-and-drop system, custom virtual scrolling engine, live collaboration indicators, and URL-synced filters — all without any restricted libraries.

## Live Demo

> **Live Link:** [https://project-management-app-six-zeta.vercel.app/](https://github.com/Joshianshul007/ProjectManagement-App) (Please replace with your actual Vercel/Netlify URL)

---

## Setup Instructions

**Prerequisites:** Node.js 18+, npm 9+

```bash
# Clone the repository
git clone https://github.com/Joshianshul007/ProjectManagement-App.git
cd ProjectManagement-App

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

**Tech stack:** React 18 · TypeScript 5 · Zustand 4 · Tailwind CSS 3 · Vite 5

---

## State Management Decision — Why Zustand

Zustand was chosen over React Context + useReducer for three reasons:

1. **Granular subscriptions.** Components subscribe to exact slices of state (`state => state.filters`) rather than the full context value. This prevents cascading re-renders — e.g., the `ActiveUsersOverlay` re-renders only when `activeUsers` changes, not when a filter is toggled.

2. **Zero boilerplate.** Context requires wrapping the tree, creating actions, and wiring a reducer. Zustand collapses this into a single `create()` call with typed actions defined inline.

3. **Centralized drag state.** The dragging task ID and drop-target status (`draggingTaskId`, `dropTargetStatus`) are global so any component — including the ghost card outside the Kanban grid — can read and react to them without prop drilling.

---

## Custom Virtual Scrolling — Implementation

Implemented in `src/views/ListView.tsx` with no external library.

**Core mechanism:**
1. A scroll container fires `onScroll`, storing `scrollTop` in `useState`.
2. The visible window is computed: `rawStart = floor(scrollTop / ROW_HEIGHT)`, `rawEnd = floor((scrollTop + containerHeight) / ROW_HEIGHT)`.
3. A 5-row buffer is added: `startIndex = max(0, rawStart - 5)`, `endIndex = min(total - 1, rawEnd + 5)`.
4. Only `sortedTasks.slice(startIndex, endIndex + 1)` is rendered — typically 15–25 rows from 505 tasks.
5. Two spacer `<tr>` elements (`topSpacerHeight = startIndex × ROW_HEIGHT`, `bottomSpacerHeight = (total - 1 - endIndex) × ROW_HEIGHT`) maintain the full scrollbar height without rendering off-screen rows.

**Performance:** Sorting is wrapped in `useMemo([tasks, sortColumn, sortDirection])` so the O(n log n) sort never runs during scroll. `ListViewRow` is wrapped in `React.memo`. The `SortableHeader` component is defined at module scope to prevent remount cycles inside the scroll handler.

---

## Custom Drag-and-Drop — Implementation

Implemented in `src/views/KanbanView.tsx` and `src/components/KanbanCard.tsx` using the native `PointerEvent` API — no libraries.

**Architecture:**

| Event | Handler | Action |
|---|---|---|
| `onPointerDown` | `handlePointerDown` | Records start position in `useRef`, sets `draggingTaskId` in Zustand |
| `window pointermove` | `handlePointerMove` | Translates ghost card via `transform: translate3d(x,y,0)` directly on a DOM ref — bypasses React rendering entirely for 60fps |
| `window pointerup` | `handlePointerUp` | Reads `dropTargetStatus` from Zustand, calls `updateTaskStatus`, clears state |

**Key techniques:**
- **No layout shift:** The source card gets `opacity-0 pointer-events-none` — it stays in the DOM, holding its space. The column never collapses.
- **Drop zone detection:** `document.elementsFromPoint(x, y)` hits test all elements under the pointer (including through the ghost, which has `pointer-events-none`), finding the nearest `[data-column-status]` element.
- **Snap-back:** If `pointerup` fires with no valid `dropTargetStatus`, no status update is made. The ghost disappears and the original card's opacity is restored — appearing to snap back.
- **Touch + mouse:** `PointerEvent` handles both; `touch-action: none` on cards prevents native scroll conflicts.

---

## Lighthouse Screenshot

> Run Lighthouse in Chrome DevTools on the production build (`npm run build && npm run preview`) and attach a screenshot here before submission.

---

## Project Structure

```
src/
├── types/          → Task, TaskStatus, TaskPriority, Assignee interfaces
├── store/          → useTaskStore (Zustand — single source of truth)
├── hooks/          → useFilteredTasks, useUrlFilters
├── utils/          → dateFormatter (pure functions)
├── data/           → mockTasks (505 tasks via seeded PRNG)
├── views/          → KanbanView, ListView, TimelineView
└── components/     → KanbanCard, ListViewRow, FilterBar, TopNavbar, ActiveUsersOverlay
```

## Explanation

The hardest UI problem was preventing layout shift during drag-and-drop. When you lift a card from a Kanban column, the naive approach — removing it from the DOM or collapsing its height — causes every card below it to jump upward violently. My solution was to keep the source card in the DOM at full size but apply `opacity-0 pointer-events-none`, making it visually invisible while its physical space is preserved. The column never reflows.

The drag ghost itself is rendered as a separate fixed-position element and animated via `transform: translate3d(x,y,0)` written directly to a `useRef`-held DOM node inside `requestAnimationFrame`. This completely bypasses React's rendering cycle during drag, achieving hardware-accelerated 60fps motion without triggering any component re-renders.

Drop zone detection avoids `onDragEnter`/`onDragLeave`'s well-known event-bubbling issues. Instead, I probe `document.elementsFromPoint(x, y)` on every `pointermove` — since the ghost has `pointer-events-none`, this hits the column beneath it cleanly.

If I had more time, I'd refactor the `ActiveUsersOverlay` from a polling-based DOM-query model (which uses `querySelectorAll` on every `activeUsers` change) to a layout-effect-driven approach that reads element positions through React refs — eliminating the dependency on DOM attribute selectors and making the overlay resilient to concurrent rendering.
 the dependency on DOM attribute selectors and making the overlay resilient to concurrent rendering.