## FILE: `backend/README.md`

````markdown
# ProLancer — Backend (MERN Backend, TypeScript, Node.js, Express, Mongoose)

## Tech

- Node.js (v18+ recommended)
- TypeScript
- Express.js
- Mongoose (MongoDB)
- JWT (access + refresh token rotation)
- bcrypt
- Stripe (server-side keys + webhooks)
- Pusher (server for realtime events)

## Quick setup (paste into terminal)

```bash
# from project root
cd backend
npm install
# run dev with ts-node/ts-node-dev or nodemon + ts-node
npm run dev
```
````

## `.env` (paste)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=mongodb://localhost:27017/prolancer

# Admin seeding
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword

# Security
BCRYPT_SALT_ROUNDS=10
ACCESS_TOKEN_SECRET=your_access_token_secret_min_32_chars
ACCESS_TOKEN_EXPIRES=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_min_32_chars
REFRESH_TOKEN_EXPIRES=7d

# Pusher
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=ap2

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## package.json scripts (example)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed:admin": "ts-node src/tools/seedAdmin.ts"
  }
}
```

## tsconfig (minimal)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Folder structure (recommended)

```
backend/
├─ src/
│  ├─ controllers/
│  ├─ routes/
│  ├─ services/        # business logic (stripe, pusher)
│  ├─ models/          # mongoose schemas
│  ├─ middlewares/     # auth, errorHandler, validate
│  ├─ utils/           # helpers (token, logger)
│  ├─ config/          # db, pusher, stripe init
│  ├─ types/           # TS interfaces
│  └─ server.ts        # app bootstrap
└─ .env
```

## Important endpoints (copy to routes)

- `POST /auth/login`
- `POST /auth/refresh-token`
- `POST /user/register`
- `GET /user/me` `PATCH /user/me`
- Job routes: `POST /jobs`, `GET /jobs`, `GET /jobs/:slug` etc.
- Applications: `POST /applications`, `PATCH /applications/:id/status`
- Chat: `POST /chats`, `GET /chats/my-chats`, `POST /chats/:chatId/messages`
- Payment: `POST /payment/create-checkout-session`, `POST /payment/webhook`

## Stripe webhook notes

- Use `STRIPE_WEBHOOK_SECRET` to verify signatures in `/payment/webhook`.
- For local dev, the Stripe CLI can forward events to your local server.

## JWT / Auth best practices (quick)

1. Use short-lived access tokens (e.g. 15m or 1d depending on risk) and rotate refresh tokens.
2. Store refresh tokens in db (hashed) and set httpOnly secure cookie for browser clients.
3. Protect routes with `authMiddleware` that verifies access token and loads `req.user`.

## Pusher (server)

- Initialize Pusher with `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_APP_ID`, and `PUSHER_CLUSTER`.
- Emit events on chat create/message and on notifications.

## Admin seeding script (quick)

Create `src/tools/seedAdmin.ts` that reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` and upserts an admin user into DB.

## Start example (server.ts)

```ts
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
// register routes here
mongoose.connect(process.env.DATABASE_URL!).then(() => {
  app.listen(process.env.PORT || 5000, () => console.log("Server running"));
});
```

## Notes

- Keep Stripe secret key server-side only.
- For production webhooks, point Stripe to `https://yourdomain.com/api/v1/payment/webhook` and set the `STRIPE_WEBHOOK_SECRET`.
- Use helmet, cors (restrict to FRONTEND_URL), rate-limit, and input validation (zod or Joi).
