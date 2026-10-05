# 🎨 ShelfLife - Library Management Platform (Frontend)

A modern, typed **React 18 + TypeScript + Vite** frontend application for the ShelfLife Library Management Platform.

---

## 🚀 Quick Start & Running

### Prerequisites
- Node.js (v18+)
- npm

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

> Ensure the ShelfLife backend server is running on `http://localhost:5000` to connect to real API endpoints.

---

## 📂 Project Component Architecture

```
frontend/src/
├── api/
│   └── client.ts            # Typed Axios API client & request interceptors
├── components/
│   ├── common/
│   │   ├── DataTable.tsx    # Generic reusable <DataTable<T>> component
│   │   ├── Select.tsx       # Generic reusable <Select<T>> dropdown component
│   │   ├── Toast.tsx        # Toast notification system & provider
│   │   ├── Navbar.tsx       # Header with navigation & librarian profile state
│   │   └── ProtectedRoute.tsx # Client-side route protection wrapper
├── context/
│   └── AuthContext.tsx      # Librarian auth state & JWT token persistence
├── pages/
│   ├── BooksPage.tsx        # Book List page with search, genre filter & Add Book modal
│   ├── IssueBookPage.tsx    # Issue Book form with loading state & toast alerts
│   ├── MemberHistoryPage.tsx# Member history page with visually distinct OVERDUE badges
│   ├── LoginPage.tsx        # Librarian authentication portal with demo login button
│   └── NotFoundPage.tsx     # 404 page
├── types/
│   └── index.ts             # Shared TypeScript type definitions
├── App.tsx                  # React Router DOM layout & route setup
└── index.css                # Glassmorphic dark design system & responsive utility classes
```

---

## 💡 State Management Architecture Note (Q2 Deliverable)

### Decision: **Local State + React Context API**

For the ShelfLife frontend, we adopted a clean hybrid approach combining **React Local State (`useState`)** and **React Context API (`AuthContext` & `ToastContext`)**:

1. **Global Auth Context (`AuthContext`):**
   - Holds librarian authentication state (`user`, `token`, `isAuthenticated`).
   - Persists JWT tokens in `localStorage` so librarians remain logged in across page reloads.
   - Provides a clean interface for `login()` and `logout()` throughout the app.

2. **Global Toast Notification Context (`ToastContext`):**
   - Manages asynchronous user feedback (e.g. "Book issued successfully", "Selected book out of stock").
   - Decouples UI feedback from business logic across form submit handlers.

3. **Local Component State (`useState`, `useEffect`):**
   - Table state, search queries, pagination indices, modal visibility, and drop-down filters are intentionally kept localized inside page components (`BooksPage`, `IssueBookPage`, `MemberHistoryPage`).
   - Keeps component logic isolated, predictable, and free from global state clutter.

**Why not Redux / Zustand / React Query?**
For a focused library management platform, local state + Context provides zero overhead, fast build times, strict TypeScript type safety, and minimal bundle size while fully avoiding redundant re-renders.

---

## ⭐️ Key Features & Deliverables

- **Generic Reusable Components:**
  - `<DataTable<T>>`: Handles generic data formatting, skeleton loading, empty state, and pagination for `Book`, `Member`, and `BorrowRecord`.
  - `<Select<T>>`: Handles typed options, custom labels, and disabled item flags.
- **Visual Overdue Badges:**
  - Items where `dueDate < today` and status is unreturned display an animated, red glowing **`OVERDUE`** badge.
- **Route Protection:**
  - Protected routes (`/issue`) automatically redirect unauthenticated users to `/login` with return destination memory.
- **In-Flight Request Guarding:**
  - The "Issue Book" form disables the submit button and displays an inline spinner while the HTTP request is pending.
