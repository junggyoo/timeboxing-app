Of course. As a senior technical architect, my focus is on creating a specification that is immediately actionable, removes unnecessary complexity, and aligns directly with the MVP goals outlined in the PRD.

Here is the complete, refined Technical Requirements Document (TRD).

---

# **Technical Requirements Document (TRD): Timebox Service MVP**

## 1. Overview

This document specifies the technical architecture for a responsive web application designed for timeboxing, as defined in the PRD. The architecture prioritizes rapid development, scalability, and a seamless multi-device user experience by leveraging a modern, server-centric stack with a Backend-as-a-Service (BaaS) provider.

## 2. Core Technology Stack (MVP)

| Category                  | Technology                                  | Justification                                                                                                |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Framework**             | Next.js 15 (App Router)                     | Full-stack capabilities for UI and API, enabling rapid development. Server Components enhance initial load performance. |
| **Backend-as-a-Service**  | Supabase                                    | Provides Auth, PostgreSQL Database, and Realtime sync out-of-the-box, covering all core backend needs for the MVP. |
| **Styling**               | Tailwind CSS + shadcn/ui                    | Utility-first CSS for rapid, consistent UI development. shadcn/ui provides accessible, unstyled component primitives. |
| **Data Fetching / State** | TanStack Query (`@tanstack/react-query`)    | Manages server state, caching, and data synchronization, simplifying data flow between client and server.     |
| **Language**              | TypeScript                                  | Ensures type safety and improves code maintainability.                                                       |

**Removed from original proposal:**
*   **Hono.js:** Unnecessary complexity. Next.js Route Handlers are sufficient for the API needs of the MVP.
*   **Stripe:** Out of scope for the MVP. Integration will be planned post-beta.

## 3. System Architecture

The system is a monolithic Next.js application, simplifying deployment and development.

*   **Frontend:** A responsive single-page application built with Next.js and React. It will utilize Server Components for static content and Client Components for interactive elements like the timer and calendar interface.
*   **Backend API:** Simple RESTful endpoints will be implemented using Next.js Route Handlers. All business logic will reside within these handlers or be abstracted into a shared `/lib` directory.
*   **Database:** A managed Supabase PostgreSQL instance located in `ap-northeast-1` (Seoul).
*   **Authentication:** Supabase Auth will handle user identity. The MVP will support **Email/Password** authentication only. Client-side session management will use Supabase's helpers.
*   **Real-time Sync:** To meet the multi-device sync requirement, the application will use **Supabase Realtime Subscriptions**. When a timebox is created or updated on one device, other active clients subscribed to the user's data will receive the update instantly.

## 4. Data Schema (Supabase PostgreSQL)

The database schema is designed to be minimal for the MVP. Reports will be computed on-demand from the `timeboxes` table, not stored separately.

**Table: `profiles`**
*   Mirrors the `auth.users` table for public user data.
*   `id` (uuid, Primary Key, Foreign Key to `auth.users.id`)
*   `email` (varchar)
*   `created_at` (timestamp with time zone)

**Table: `timeboxes`**
*   The core entity for all user plans.
*   `id` (uuid, Primary Key)
*   `user_id` (uuid, Foreign Key to `auth.users.id`)
*   `title` (text, not null)
*   `start_time` (timestamp with time zone, not null)
*   `end_time` (timestamp with time zone, not null)
*   `status` (enum: `planned`, `completed`, `missed`), default: `'planned'`
*   `created_at` (timestamp with time zone)

## 5. API Endpoint Specification (MVP)

All endpoints are protected and require user authentication.

| Method | Endpoint                  | Description                                            |
| ------ | ------------------------- | ------------------------------------------------------ |
| `POST` | `/api/timeboxes`          | Creates a new timebox for the authenticated user.      |
| `GET`  | `/api/timeboxes`          | Retrieves timeboxes for a given date range (e.g., day, week). |
| `PUT`  | `/api/timeboxes/[id]`     | Updates a timebox (e.g., changes title, time, or status). |
| `DELETE`| `/api/timeboxes/[id]`     | Deletes a timebox.                                     |
| `GET`  | `/api/reports`            | Computes and returns report data (e.g., completion rate, total time). |

## 6. Key Feature Implementation Notes

*   **Timebox Creation:** The UI will support a drag-and-drop calendar view. The "natural language" input will be a simplified parser for MVP (e.g., "Meeting 2pm-3pm") rather than a complex NLP engine.
*   **Timer & Notifications:**
    *   The countdown timer's state will be managed client-side. To ensure accuracy when the tab is inactive, a **Web Worker** will be used to manage the timer logic.
    *   Notifications will be implemented using the **Browser Notification API**. PWA push notifications are a post-MVP enhancement. The app will request notification permission upon the user's first timer interaction.
*   **Responsive Design:** The layout will be mobile-first, targeting a minimum viewport of `360px`. A separate desktop layout will be applied at viewports `1280px` and wider using Tailwind CSS breakpoints.

## 7. Simplified Directory Structure

This structure is feature-oriented, aligns with Next.js App Router conventions, and avoids premature abstraction.

```
/
├── public/                     # Static assets (images, fonts)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route group for auth pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (main)/             # Route group for authenticated app core
│   │   │   ├── dashboard/      # Main timebox view
│   │   │   │   ├── _components/  # Components specific to the dashboard
│   │   │   │   └── page.tsx
│   │   │   └── reports/        # Reports view
│   │   │       └── page.tsx
│   │   ├── api/                # API Route Handlers
│   │   │   └── [route]/
│   │   │       └── route.ts
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # Shared UI components (e.g., Button, Dialog)
│   │   └── ui/                 # shadcn/ui components
│   └── lib/                    # Shared utilities, configs, and clients
│       ├── supabase/           # Supabase client instances (client, server)
│       └── utils.ts            # Global utility functions
└── supabase/
    └── migrations/             # Database migration files
```