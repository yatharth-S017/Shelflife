# 📚 ShelfLife - Library Management System API (Backend)

ShelfLife is a RESTful API built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB (Mongoose)** for managing books, library members, and borrowing workflows.

---

## 🚀 Quick Setup & Running

### Prerequisites
- Node.js (v18+)
- npm

### 1. Installation
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend` directory (or use default `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shelflife
JWT_SECRET=shelflife_secret_key_jwt_2026_super_secure
USE_MEMORY_DB=true
```
> Note: Setting `USE_MEMORY_DB=true` uses an in-memory MongoDB instance out of the box so no external MongoDB daemon is required to run and test the application!

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000` and automatically seed initial data into the database!

---

## ⚡ Q1 e) Race Condition Prevention (Simultaneous Borrowing)

> **Question:** How do you prevent two librarians from issuing the last copy of the same book at the same time?

### 💡 Answer / Explanation:
To prevent race conditions where two concurrent requests try to issue the last available copy (`availableCopies = 1`), we use **Atomic Query Operations** in MongoDB via `findOneAndUpdate`:
```typescript
const updatedBook = await Book.findOneAndUpdate(
  { _id: bookId, availableCopies: { $gt: 0 } }, // Atomic precondition check
  { $inc: { availableCopies: -1 } },             // Atomic decrement
  { new: true }
);
if (!updatedBook) {
  throw new AppError('No available copies left for this book', 400);
}
```
**Why this works:**
1. MongoDB locks single documents at the engine level for atomic write operations.
2. The query filter `availableCopies: { $gt: 0 }` is evaluated atomically alongside `$inc: { availableCopies: -1 }`.
3. If two requests arrive simultaneously when `availableCopies === 1`, only the first thread matches the query condition and decrements to 0. The second concurrent thread fails the `{ $gt: 0 }` query filter, receives `null`, and receives an immediate `400 Bad Request` without corrupting state.
4. For multi-document workflows, MongoDB ACID Sessions (`mongoose.startSession()`) or Optimistic Concurrency Control with version keys (`__v`) can also be employed.

---

## 📡 REST API Reference

All requests accept and return JSON. Endpoints marked with 🔒 require header: `Authorization: Bearer <JWT_TOKEN>`.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate librarian & issue JWT |
| `GET` | `/api/books` | Public | List books with pagination & genre filter |
| `POST` | `/api/books` | 🔒 Librarian | Register a new book |
| `GET` | `/api/members` | Public | List all registered members |
| `POST` | `/api/members` | 🔒 Librarian | Register a new library member |
| `POST` | `/api/borrow` | 🔒 Librarian | Issue a book to a member |
| `POST` | `/api/return/:borrowId` | 🔒 Librarian | Return an issued book |
| `GET` | `/api/members/:id/history` | Public | Get full borrow history for a member |

---

## 🧪 Sample cURL Requests

### 1. Librarian Login (Get JWT Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "librarian@shelflife.com", "password": "password123"}'
```

### 2. List Books with Pagination & Genre Filter
```bash
curl -X GET "http://localhost:5000/api/books?page=1&limit=5&genre=Technology"
```

### 3. Add a New Book 🔒
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title": "Refactoring: Improving the Design of Existing Code",
    "author": "Martin Fowler",
    "ISBN": "9780134757599",
    "genre": "Software Engineering",
    "totalCopies": 4,
    "availableCopies": 4
  }'
```

### 4. Register a New Member 🔒
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "David Miller",
    "email": "david.m@example.com",
    "membershipId": "MEM-1004"
  }'
```

### 5. Issue a Book to a Member 🔒
```bash
curl -X POST http://localhost:5000/api/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "bookId": "<BOOK_OBJECT_ID>",
    "memberId": "<MEMBER_OBJECT_ID>",
    "dueDate": "2026-10-25T00:00:00.000Z"
  }'
```

### 6. Return an Issued Book 🔒
```bash
curl -X POST http://localhost:5000/api/return/<BORROW_RECORD_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### 7. Get Member Borrow History
```bash
curl -X GET http://localhost:5000/api/members/<MEMBER_OBJECT_ID>/history
```
