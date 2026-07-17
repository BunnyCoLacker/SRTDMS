# Utang Ledger — Debt Management System for Sari-Sari Stores

A MERN stack app (MongoDB, Express, React, Node) with Tailwind CSS for tracking
customer debt ("utang") in a sari-sari store.

## Roles

**Admin (you)**

- CRUD user accounts (admin or store owner)
- View a live user activity report (online/offline, last seen)
- Create a named **Storage** (a domain/workspace) and choose exactly which
  store owner accounts may access it
- Enable/disable accounts and storages

**Store Owner**

- On login, the system checks for an active Storage assigned to them.
  No active storage → login is blocked with a clear message.
- Create Borrowers (customers who keep a tab) inside their Storage
- Add debt records per borrower: product name, quantity, unit price, date
- Pay a debt in full (one click) or make a partial payment — the balance
  updates automatically
- Cancel a borrower (soft-cancel, history is preserved)
- See Overdue debts, counted from the day each debt was borrowed
- Review a full Transaction history (debts added, payments, cancellations)

## Project structure

```
dms-mern/
  backend/     Express + Mongoose API
  frontend/    React (Vite) + Tailwind CSS
```

## 1. Backend setup

```bash
cd backend
npm install
```

`backend/.env` is already filled in with your MongoDB Atlas connection string:

```
MONGO_URI=mongodb+srv://lianbugtai_db_user:****@cluster0.evjiy8q.mongodb.net/dms?appName=Cluster0
JWT_SECRET=change_this_to_a_long_random_secret_before_deploying
ADMIN_EMAIL=admin1@sarisaridms.com
ADMIN_PASSWORD=Admin123!
```

> ⚠️ **Important:** you pasted your database username/password directly in
> chat. Treat that password as compromised — rotate it in MongoDB Atlas
> (Database Access → Edit user → Edit password) before this goes anywhere
> near production, then update `MONGO_URI` in `.env`. Also change
> `JWT_SECRET` to a long random string, and change the admin password after
> your first login. `.env` is already git-ignored so it won't get committed.

Seed the first Admin account (Admin 1) from the values in `.env`:

```bash
npm run seed:admin
```

Start the API:

```bash
npm run dev
```

The API runs locally on `http://127.0.0.1:5000` unless you override it with environment variables.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app uses `VITE_API_URL` for its API calls, with `/api` as a fallback for local development. For a Netlify deployment, set `VITE_API_URL` to your hosted backend URL.

## 3. First login

Go to the frontend URL and sign in with:

- Email: `admin1@sarisaridms.com`
- Password: `Admin123!`

From the Admin console:

1. **Users** → create a Store Owner account.
2. **Storages** → create a storage, name it after the store, and check the
   store owner(s) allowed to access it.
3. Log out and sign in as that store owner — they'll land on the Borrowers
   screen and can start adding debt records.

## Notes on how "online/offline" is tracked

Every authenticated API request refreshes `isOnline` and `lastSeen` for that
user. A user is shown "offline" once they log out or their session goes
idle. The admin Reports page auto-refreshes every 15 seconds.

## Notes on overdue tracking

Each debt record gets a `dueDate` (default 30 days from the borrow date,
adjustable per entry). A debt is "overdue" once today is past `dueDate` and
the balance isn't fully paid. The Overdue page shows exactly how many days
each one has been overdue.
