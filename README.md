<div align="center">

# ⚡ BackendMaster AI

> **An AI-powered learning platform covering 500+ backend engineering concepts with dynamic lesson generation, voice narration, PDF roadmap parsing, and offline caching.**

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-Start-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/router)
[![Supabase](https://img.shields.io/badge/Supabase-DB_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Styling-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

</div>

## 🚀 Key Highlights

- 📚 **500+ Curriculum Topics**: Java, Spring Boot, Docker, Kubernetes, AWS, System Design, Microservices, MongoDB, Redis, and Git.
- 🤖 **On-Demand AI Lessons**: Generates 14 detailed sections per topic including architecture diagrams, trade-offs, code examples, MCQs, and interview questions.
- 🎙️ **Offline Voice Reader**: Browser-native Text-to-Speech narration with sentence highlighting and hands-free voice Q&A.
- 📄 **PDF Roadmap Parser**: Upload custom developer roadmaps; automatically extracts topic nodes, quality metrics, and missing concept gaps.
- ⚡ **0ms Offline Caching**: Instant local storage caching paired with bulk offline downloads and Supabase cloud sync.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend & SSR** | React 18, TanStack Router (Start), Vite |
| **Styling** | Vanilla CSS, Tailwind CSS, Radix UI |
| **Backend & Database** | Supabase (PostgreSQL, Auth, RPC) |
| **AI Gateway** | OpenRouter (DeepSeek / Claude / GPT) |
| **Runtime & Deploy** | Cloudflare Workers / Nitro |

---

## 📁 Folder Overview

```ascii
BackendMaster/
├── src/
│   ├── components/      # VoiceReader, AiTeacher, AppShell, Markdown
│   ├── integrations/    # Supabase client & DB types
│   ├── lib/             # Curriculum, AI generation, local storage & downloader
│   └── routes/          # TanStack file-based routes (Dashboard, Lessons, Auth, Admin)
├── .github/workflows/   # CI/CD deployment pipelines (Dev, UAT, Release, Main)
└── vite.config.ts       # Vite build config
```

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/anandumon/BackendMaster.git
cd BackendMaster

# 2. Configure environment (.env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=your-openrouter-key

# 3. Install & run dev server
npm install
npm run dev
```

---

## 🧪 Pipeline Scripts

```bash
npm run lint       # Code style check (ESLint)
npm run typecheck  # Strict TypeScript compilation check
npm run build      # Production bundle build
```

---

<div align="center">

Made by **Anandumon**

</div>
