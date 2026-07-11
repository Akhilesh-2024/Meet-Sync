# MeetSync

Smart meeting scheduling across calendars and time zones.

MeetSync helps teams find the best meeting time by checking attendee availability, calculating common free slots, and booking meetings from one place.

## Features

* Email/password authentication with JWT and bcrypt
* Calendar availability with a built-in mock provider
* Optional Google Calendar integration
* Smart scheduling for 15, 30, and 60-minute meetings
* Multi-attendee availability matching
* Meeting suggestions and booking
* Meeting dashboard
* Email notification support
* Redis caching support
* Security with Helmet, CORS, rate limiting, and encrypted OAuth tokens

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Axios

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, Redis, JWT

**Integrations:** Google Calendar, SendGrid

**DevOps:** Docker, Docker Compose, GitHub Actions, Jest

## Project Structure

```text
meetsync/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── tests/
│       └── utils/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── stores/
│       └── types/
├── .github/workflows/
├── docker-compose.yml
└── README.md
```

## Requirements

* Node.js 20+
* npm
* Git
* Docker Desktop

MongoDB and Redis can run through Docker.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Akhilesh-2024/Meet-Sync.git
cd MeetSync
```

### 2. Start MongoDB and Redis

```bash
docker compose up -d mongo redis
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
npm install
```

Generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Add the generated values to `.env`:

```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ENCRYPTION_KEY=
```

Start the backend:

```bash
npm run dev
```

API: `http://localhost:4000`

Health check: `http://localhost:4000/health`

### 4. Start the frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Environment Variables

### Backend

```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/meetsync
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

ENCRYPTION_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/calendar/google/callback

SENDGRID_API_KEY=
EMAIL_FROM=noreply@example.com
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Never commit `.env` files containing real credentials.

## API

Base URL:

```text
/api/v1
```

### Authentication

```text
POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /auth/me
```

### Calendar

```text
GET /calendar/availability
GET /calendar/google/url
GET /calendar/google/callback
```

### Scheduling

```text
POST /suggest
POST /book
GET  /meetings
```

### Health

```text
GET /health
```

## Scheduling

MeetSync:

1. Collects attendee calendars
2. Retrieves busy periods
3. Merges overlapping events
4. Calculates common availability
5. Finds suitable meeting slots
6. Suggests the best available times
7. Books the selected slot

When Google Calendar is not configured, a deterministic mock calendar is used for development.

## Google Calendar

Google Calendar is optional. Configure OAuth credentials in the backend environment to enable it.

Without Google credentials, MeetSync automatically uses the mock calendar provider.

## Development

Run backend tests:

```bash
cd backend
npm test
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

Run the complete application with Docker:

```bash
docker compose up -d --build
```

## Deployment

MeetSync can be deployed using Docker to platforms such as AWS ECS/Fargate, Render, Railway, Fly.io, Google Cloud, or Azure.

For production:

* Use managed MongoDB such as MongoDB Atlas
* Use strong secrets
* Enable HTTPS
* Configure production CORS
* Configure Google Calendar OAuth if required
* Configure an email provider if notifications are needed

## Roadmap

* Outlook / Microsoft 365 integration
* Google Meet and Zoom links
* Recurring meetings
* RSVP tracking
* Cancellation and rescheduling
* Custom working hours
* Advanced scheduling preferences
* Background calendar synchronization
* Improved mobile experience
* Analytics

## License

Currently intended for personal and educational development. Add an appropriate license before public distribution.

---

**MeetSync** — simple scheduling for teams working across calendars and time zones.