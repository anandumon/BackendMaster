<div align="center">

# ⚡ BackendMaster AI

### *The Ultimate AI-Powered Mastery Platform for Backend Engineering*

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-Start-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/router)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Vanilla_Design-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <b>Comprehensive backend developer curriculum inspired by roadmap.sh</b> — powered by OpenRouter AI generation, real-time voice synthesis, interactive quizzes, PDF roadmap parsing, and offline caching.
</p>

---

</div>

## 🌟 Key Features

### 🎓 1. Comprehensive Curriculum Catalog
- **500+ Curated Topics** across **11 Core Domains**:
  - ☕ **Java**: JVM, Memory Model, Garbage Collection, Concurrency, Fork/Join, Virtual Threads.
  - 🍃 **Spring Boot**: IoC, MVC, Data JPA, Security, WebFlux, Actuator, Native.
  - 🧩 **Backend Foundations**: Networking, HTTP/3, REST, GraphQL, gRPC, OAuth2, Rate Limiting.
  - 🏛️ **Design & Architecture**: SOLID, Clean Architecture, DDD, CQRS, Microservices, System Design.
  - 🐳 **Docker**: Containers, Multi-Stage Builds, BuildKit, Compose, Security.
  - ☸️ **Kubernetes**: Pods, StatefulSets, Ingress, Helm, GitOps, Operators.
  - ☁️ **AWS**: EC2, S3, RDS, DynamoDB, Lambda, VPC, CloudFront, EKS.
  - 🍃 **MongoDB**, 🔴 **Redis**, 🌿 **Git & GitHub**, ⚡ **Data Structures & Algorithms**.

---

### 🤖 2. On-Demand AI Lesson Generation
- Every single topic dynamically generates deep, production-grade lessons with 14 detailed sections:
  1. **Overview & Definition**
  2. **Why This Concept Exists**
  3. **Detailed Theory & Architecture**
  4. **Internal Working Mechanism**
  5. **Real-World System Examples**
  6. **Advantages & Tradeoffs**
  7. **Disadvantages & Edge Cases**
  8. **Best Practices & Industry Standards**
  9. **Common Pitfalls & Mistakes**
  10. **Practical Code & Configuration Usage**
  11. **Senior Engineering Interview Questions**
  12. **Cheatsheet & Memory Anchors**
  13. **Prerequisites & Next Steps**
  14. **Revision Notes, MCQs & Flashcards**

---

### 🎙️ 3. Built-in Voice Reader & AI Tutor
- **Offline TTS Engine**: Browser-native Web Speech API speech synthesis with speed control (`0.5x`–`2.0x`), voice selection, and sentence-level scrolling highlight.
- **Voice Assistant**: Hands-free voice querying for answering questions via the built-in AI Teacher drawer.

---

### 📁 4. PDF Roadmap Extraction & Completeness Engine
- Upload custom PDF developer roadmaps in the **Admin Dashboard**.
- Automatically extracts topic hierarchies, calculates parse quality metrics, confidence scores, and detects missing topics.

---

### ⚡ 5. Instant Caching & Offline Mode
- **0ms Initial Loads**: Instant local storage cache checks paired with Supabase database synchronization.
- **Bulk Downloader**: Single-click "Download All Lessons" feature to pre-fetch and cache entire learning paths for offline study.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/router) / [Vite](https://vitejs.dev/) | SSR-ready client & server routing |
| **UI Core** | [React 18](https://react.js.org) + [Lucide Icons](https://lucide.dev) | Interactive component UI |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com) | Modern dark/light glassmorphic styling |
| **Database & Auth** | [Supabase](https://supabase.com) | User state, lesson overrides, activity tracking, authentication |
| **AI Gateway** | OpenRouter (DeepSeek / Claude / GPT) | Structured JSON lesson generation & AI Teacher queries |
| **Speech Engine** | Web Speech API | Offline Text-to-Speech & Speech-to-Text |
| **Deployment** | Cloudflare Workers / Nitro | Edge computing production server |

---

## 📁 Repository Structure

```ascii
BackendMaster/
├── .github/
│   └── workflows/         # GitOps CI/CD (Dev, UAT, Release, Main validation)
├── src/
│   ├── components/        # UI components (AiTeacher, AppShell, VoiceReader, etc.)
│   ├── integrations/      # Supabase client & type definitions
│   ├── lib/               # Core business logic
│   │   ├── curriculum.ts       # Static catalog (500+ topics)
│   │   ├── curriculum-extra.ts # Extracted roadmap merging & PDF quality engine
│   │   ├── lesson-db.ts        # Database persistence layer
│   │   ├── storage.ts          # Local storage caching & resume tracking
│   │   └── offline-downloader.ts # Bulk offline caching pipeline
│   ├── routes/            # TanStack file-based routing
│   │   ├── index.tsx           # Dashboard & learning progress
│   │   ├── auth.tsx            # Sign in / Sign up / Email verification
│   │   ├── lesson.$slug.tsx    # Dynamic lesson viewer & generator
│   │   ├── offline.tsx         # Offline lesson manager
│   │   └── admin.*.tsx         # Admin dashboard, PDF parsing, regeneration queue
│   └── styles.css         # Global design system & custom CSS utilities
├── vite.config.ts         # Vite build configuration
└── package.json           # Scripts & dependencies
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **npm**: `v9.x` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/anandumon/BackendMaster.git
cd BackendMaster
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Launch Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:8080`.

---

## 🧪 Quality Assurance & Building

Run static analysis, type checking, and production build checks:

```bash
# Code Quality Check
npm run lint

# TypeScript Compilation Check
npm run typecheck

# Production Bundle Build
npm run build
```

---

## 🔄 Deployment & CI/CD Pipeline

The project includes automated GitHub Actions workflows for multi-tier deployment:
- **`pr-validation.yml`**: Validates formatting, TypeScript compilation, and linting on every Pull Request.
- **`dev.yml`**: Automated deployment to Development environment.
- **`uat.yml`**: UAT testing deployment pipeline.
- **`release.yml`**: Release candidate bundling.
- **`main.yml`**: Production deployment to Cloudflare Workers / Nitro.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [Issues page](https://github.com/anandumon/BackendMaster/issues).

---

<div align="center">

Made with ❤️ by **Anandumon** & powered by **Google DeepMind Antigravity AI**

</div>
