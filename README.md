# LinguaDev AI — Learn to Code in Your Language

> ## Status: 🟡 In Progress
>
> <progress value="70" max="100"></progress>
>
> **Progress: 70%** — Full learning platform (courses, tutor, practice, badges) is built; AI features need AWS/Gemini keys to come alive

<p align="center">
  <img src="./banner.webp" alt="LinguaDev AI banner" width="100%" />
</p>

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=white)

## What it is

A multilingual coding-education platform: learn programming in your own language with AI tutoring. The React frontend has course catalogs, interactive lessons, a practice playground, an AI tutor chat, dashboards with XP/badges/levels, and certifications. The Express backend serves courses, tracks progress, handles auth (JWT + bcrypt), and plugs into AWS Bedrock (AI), Polly (text-to-speech), Translate (multilingual content), and S3 — with a free Gemini fallback when AWS isn't configured. There's also an in-memory store so it runs without MongoDB.

## What works (verified)

- ✅ **Full page set** — Landing, LanguageSelection, Courses, CourseLesson, Practice, Tutor, Dashboard, Profile, Certifications, Settings, Login/Register
- ✅ **Express API** — hardened with helmet, rate limiting, morgan logging, CORS (31 route/handler registrations in `server/index.js`)
- ✅ **Data models** — `User`, `Course`, `Progress` (Mongoose) + `inMemoryStore` fallback
- ✅ **Gamification data** — badges, XP levels, `calculateLevel`/`getNextLevel` in `server/data/badges.js`
- ✅ **AI service layer** — Bedrock + Gemini (`services/bedrock.js`, `services/gemini.js`) with `isConfigured` guards
- ✅ **Media services** — Polly TTS, Translate (incl. code-comment translation), S3 uploads
- ✅ **Dev runner** — `scripts/dev-runner.js` boots frontend + backend together

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Zustand (`src/store`) |
| Backend | Node.js, Express, helmet, express-rate-limit |
| Database | MongoDB (Mongoose) or in-memory store |
| AI | AWS Bedrock (+ Gemini free fallback), Polly, Translate |
| Infra | S3, CloudWatch, render.yaml for deploy |

## How to run

You need **Node 18+**. MongoDB is optional (in-memory store works without it).

```bash
# Backend
cd server && npm install   # (if server has its own package.json; otherwise root)
npm run server             # node server/index.js — http://localhost:5000 (see .env.example)

# Frontend
npm install
npm run dev                # vite — http://localhost:5173
```

Copy `.env.example` to `.env` and fill in: `MONGODB_URI` (optional), `AWS_*` keys (optional — Gemini key works as the free AI path), `JWT_SECRET`. Without AI keys the courses, practice, and dashboard still work; tutor/AI features degrade gracefully via the `isConfigured` guards.

## Screenshots

No screenshots are committed in the repo. The banner above is generated; the app includes a landing page, course catalog, lesson player, AI tutor chat, and a gamified dashboard.

## What you can add more

- [ ] **Screenshots / demo video** — the landing + tutor are the selling points; show them
- [ ] **Real course content** — `server/data/courses.js` is the seed; expand the catalog
- [ ] **Code execution** — the Practice page needs a runnable sandbox (or judge0 API)
- [ ] **Streaks & leaderboards** — badges exist; add social motivation
- [ ] **Offline PWA** — lessons cached for low-connectivity learners
- [ ] **Trim AWS surface** — 14 service files is a lot; document which are actually wired vs aspirational

## Project structure

```
├── src/                  # React frontend
│   ├── pages/            # Landing, Courses, CourseLesson, Practice, Tutor,
│   │                     # Dashboard, Certifications, Profile, Settings…
│   ├── components/       # UI components
│   ├── store/            # Zustand state
│   └── hooks/ utils/
├── server/
│   ├── index.js          # Express app (auth, courses, progress, AI routes)
│   ├── models/           # User, Course, Progress (Mongoose)
│   ├── services/         # bedrock, gemini, polly, translate, s3, …
│   ├── data/             # courses.js, badges.js
│   └── database.js / inMemoryStore.js
├── banner.webp
├── render.yaml
└── vite.config.js
```

---
*README written after code audit on 2026-10-08.*
