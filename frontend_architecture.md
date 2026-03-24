# Frontend Architecture & File Analysis

This document provides a high-level overview of the frontend codebase, explaining how each file contributes to the application and how they interact with one another.

## 1. Entry Point & Routing

### `src/main.tsx`
- **Role**: The application entry point.
- **Function**: Mounts the React application to the DOM.
- **Key Logic**: Configures the `React Router` with routes defined here. It wraps the app in strict mode and providers.
- **Integration**: Imports `App`, `Calendar`, and `login` to define the route hierarchy.

### `src/App.tsx`
- **Role**: The main layout wrapper.
- **Function**: Defines the persistent application shell.
- **Key Logic**: Renders the `Sidebar`, `Header`, and an `Outlet` for child routes (like Calendar).
- **Integration**:
    - Imports `Sidebar` (navigation).
    - Imports `Header` (top bar controls).
    - Uses `Outlet` to render `pages/Calendar.tsx`.

## 2. Page Views

### `src/pages/Calendar.tsx`
- **Role**: The core functional page for task management.
- **Function**: Orchestrates the interaction between the sidebar (source) and the calendar (target).
- **Key Logic**:
    - **State Hub**: Manages `tasks` state, `isCreateModalOpen` state.
    - **DnD Context**: Holds the `DndContext` to enable dragging from Sidebar to Calendar.
    - **Event Handlers**: Defines `handleTaskMove`, `handleCreateTask`.
- **Integration**:
    - Passes state & handlers to `TaskSidebar`.
    - Passes state & handlers to `CalendarGrid`.
    - Renders `CreateTaskModal`.

### `src/login.tsx`
- **Role**: Authentication page.
- **Function**: Handles Sign In and Sign Up.
- **Key Logic**: Interacts with Supabase auth (via `auth.ts`) and manages form state.

## 3. Core Components

### `src/components/layout/Sidebar.tsx`
- **Role**: Application navigation (leftmost strip).
- **Function**: Static navigation links (Calendar, Tags, Settings).
- **Integration**: Part of `App.tsx` layout.

### `src/components/layout/Header.tsx`
- **Role**: Top navigation bar.
- **Function**: Display current context, user profile/logout.
- **Integration**: Part of `App.tsx` layout.

### `src/components/sidebar/TaskSidebar.tsx`
- **Role**: The "Task Palette" / Draggable Source.
- **Function**:
    - Lists "Recent Tasks" and "Templates".
    - Items here are `Draggable` (via `useDraggable` in sub-components).
    - "Quick Add" button triggers the modal.
- **Integration**:
    - Receives `onOpenCreateModal` from Calendar.
    - Uses `SidebarTemplateItem` (draggable) internally.

### `src/components/calendar/CalendarGrid.tsx`
- **Role**: The "Drop Target" / Schedule View.
- **Function**: Visualizes the week/day grid.
- **Integration**:
    - Renders `DayCell` components for each day/category slot.
    - Receives `tasks` to render them in the correct slots.

### `src/components/calendar/DayCell.tsx` & `SnapGrid.tsx`
- **Role**: Individual time/category slots.
- **Function**:
    - `SnapGrid` uses `useDroppable` to accept dropped tasks.
    - `DayCell` calculates strict positioning (pixel-perfect) for tasks based on time.

### `src/components/modals/CreateTaskModal.tsx`
- **Role**: Form for creating new tasks.
- **Function**: Captures Title, Duration, Category, Date/Time.
- **Integration**: Controlled by `Calendar.tsx` state.

## 4. Logic & Utilities

### `src/hooks/useDragAndDrop.ts`
- **Role**: Encapsulated DnD logic.
- **Function**: Handles `onDragEnd` events, calculating new times based on drop position pixels.
- **Integration**: Used by `Calendar.tsx`.

### `src/types/calendar.ts`
- **Role**: Single source of truth for TypeScript definitions.
- **Function**: Defines `Task`, `Category`, `inputs`.
- **Integration**: Imported by almost all components.

---

## Architecture Flowchart

```ascii
                                +----------------------+
                                |      main.tsx        |
                                | (Router Definition)  |
                                +----------+-----------+
                                           |
                                           v
                                +----------------------+
                                |       App.tsx        |
                                | (Layout Controller)  |
                                +----+-----+------+----+
                                     |     |      |
                    +----------------+     |      +-----------------+
                    |                      |                        |
         +----------v-----------+   +------v-------+      +---------v----------+
         | components/layout/   |   |    Outlet    |      | components/layout/ |
         |     Sidebar.tsx      |   | (Dynamic)    |      |     Header.tsx     |
         +----------------------+   +------+-------+      +--------------------+
                                           |
                                           v
                                +--------------------------+
                                |    pages/Calendar.tsx   |
                                |   (State & DnD Context)  |
                                +-------------+------------+
                                              |
              +-------------------------------+------------------------------+
              |                               |                              |
+-------------v--------------+    +-----------v-------------+   +------------v------------+
| components/sidebar/        |    | components/calendar/    |   | components/modals/      |
|    TaskSidebar.tsx         |    |    CalendarGrid.tsx     |   |   CreateTaskModal.tsx   |
| (Draggable Source)         |    | (Droppable Target)      |   | (Task Creation Form)    |
+-------------+--------------+    +-----------+-------------+   +-------------------------+
              |                               |
              |                               v
              |                   +-----------+-------------+
              |                   | components/calendar/    |
              |                   |      DayCell.tsx        |
              |                   +-----------+-------------+
              |                               |
              |                               v
              |                   +-----------+-------------+
              |                   | components/calendar/    |
              |                   |      SnapGrid.tsx       |
              |                   |    (useDroppable)       |
              |                   +-------------------------+
              |
              v
     +-------------------------------------------------------+
     |                  hooks/useDragAndDrop.ts              |
     |         (Calculates Logic for DragEnd Events)         |
     +-------------------------------------------------------+
```

## Key data flows

1.  **Task Creation (Modal)**:
    `Calendar` -> `CreateTaskModal` (User Input) -> `Calendar` (`setTasks`) -> Updates `CalendarGrid` & `TaskSidebar`.

2.  **Task Dragging (Sidebar -> Calendar)**:
    `TaskSidebar` (Draggable Template) --drag--> `CalendarGrid/SnapGrid` (Droppable Slot) --drop--> `Calendar` (via `useDragAndDrop` logic) -> New Task Created.

3.  **Task Moving (Calendar -> Calendar)**:
    `CalendarGrid` (Draggable Task) --drag--> `CalendarGrid/SnapGrid` (Droppable Slot) --drop--> `Calendar` (via `useDragAndDrop` logic) -> Task Updated.
