# 🚀 **ProLancer Backend – REST API**

A scalable backend for a freelance job marketplace (similar to Upwork/Fiverr) built with **Node.js, Express.js, TypeScript, MongoDB, Stripe, and Pusher**.

---

## 🛠️ **Tech Stack**

- **Node.js + Express.js**
- **TypeScript**
- **MongoDB + Mongoose**
- **JWT Authentication** (Access + Refresh token rotation)
- **bcrypt** for password hashing
- **Stripe** (Checkout Sessions + Webhooks)
- **Pusher** for realtime messaging

---

## ⚡ Quick Setup

```bash
cd backend
npm install
npm run seed:admin   # Seeds default admin user
npm run dev          # Starts development server
```

---

## 🔐 Environment Variables (`.env`)

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=your_mongodb_uri

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

> **Note:** `DATABASE_URL` should be a MongoDB Atlas URI.

---

## 📌 Important API Endpoints

### 🔑 **Auth**

- `POST /auth/login`
- `POST /auth/refresh-token`

### 👤 **User**

- `POST /user/register`
- `GET /user/me`
- `PATCH /user/me`

### 💼 **Jobs**

- `POST /jobs`
- `GET /jobs`
- `GET /jobs/:slug`

### 📨 **Applications**

- `POST /applications`
- `PATCH /applications/:id/status`

### 💬 **Chat**

- `POST /chats`
- `GET /chats/my-chats`
- `POST /chats/:chatId/messages`

### 💳 **Payments**

- `POST /payment/create-checkout-session`
- `POST /payment/webhook`

---

## 💰 Stripe Webhook Notes

- Incoming webhook events must be verified using `STRIPE_WEBHOOK_SECRET`.
- For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:5000/payment/webhook
```

---

## 📡 Realtime Messaging (Pusher)

Used for:

- New message events
- Chat updates
- Notifications

---

## 🧱 Project Features (Summary)

- Secure authentication with **token rotation**
- Admin seeding script
- Modular folder structure with TypeScript
- Realtime chat using Pusher
- Stripe checkout & webhook handling
- Scalable architecture suitable for production

[![Live Server](https://img.shields.io/badge/Live-Server-green?style=for-the-badge)](https://prolancers-six.vercel.app)
