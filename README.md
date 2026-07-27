# BackendMaster AI

> An AI-powered interactive learning platform for backend software engineering, built with TanStack Start, React, TypeScript, and Supabase.

---

## 📌 Project Overview

**BackendMaster AI** dynamically generates comprehensive, structured lessons across 500+ backend topics (Java, Spring Boot, System Design, Docker, Kubernetes, AWS, Databases). It provides offline caching, voice narration, AI-assisted Q&A, and PDF roadmap parsing.

---

## ✨ Features

- **Dynamic Lesson Generation**: Generates 14-part structured lessons (theory, architecture, code, trade-offs, MCQs, interview prep) via OpenRouter AI.
- **Offline First & Fast Caching**: Instant client-side storage caching with automated Supabase database persistence.
- **Voice Narration**: Browser-native text-to-speech with sentence highlighting and voice Q&A.
- **Roadmap PDF Parsing**: Upload developer roadmaps to extract topics, compute quality metrics, and identify missing concept gaps.

---

## 🛠️ Tech Stack

- **Frontend & SSR**: React 18, TanStack Router (Start), Vite
- **Language & Styling**: TypeScript, Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL, Auth, RPC)
- **AI Gateway**: OpenRouter
- **Deployment**: Cloudflare Workers / Nitro

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `^18.0.0` or `^20.0.0`
- npm `^9.0.0`

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=your-openrouter-key
```

### 3. Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📋 Available Scripts

```bash
npm run dev        # Launch local dev server (http://localhost:8080)
npm run lint       # Run ESLint check
npm run typecheck  # Run TypeScript compiler type check
npm run build      # Build production bundle
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
