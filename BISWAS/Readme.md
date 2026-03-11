# 🚀 Momentum: AI-Powered Goal & Habit Tracking (LLMOps)

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![AWS](https://img.shields.io/badge/AWS-Production-232F3E?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=googlebard)](https://ai.google.dev/)
[![Auth0](https://img.shields.io/badge/Auth0-Secured-EB5424?style=for-the-badge&logo=auth0)](https://auth0.com/)

**Momentum** is a production-ready, full-stack habit tracking application that leverages **LLMOps** principles to provide hyper-personalized coaching. By injecting user-specific relational data (goals, habit consistency, and friction logs) directly into Google's **Gemini 2.5 Flash** model, Momentum generates structured, dynamic insights to drive user retention.

The application is fully containerized and deployed using industry-standard **AWS Infrastructure** with automated CI/CD pipelines.

📄 **Live Application:** [Link coming soon]
📡 **API Documentation:** [Link coming soon]

---

## ✨ Key Features & LLMOps Integration

* **LLM Orchestration:** Integrates the `@google/generative-ai` SDK, utilizing strict JSON generation configs to ensure predictable, structured output for the frontend UI.
* **Dynamic Context Injection:** Aggregates deeply nested PostgreSQL data (Users → Goals → Habits → Logs) via Prisma to provide the AI with highly specific context for "Pattern Recognition" and "Optimal Timing" insights.
* **Enterprise Authentication:** Secured by **Auth0** Universal Login, utilizing robust JWT validation and API Audience restriction on the Express backend.
* **Modern Frontend:** Built with React, Vite, Tailwind CSS, and Recharts for highly responsive data visualization and state management.

---

## 🏗️ Production Architecture (AWS)

Momentum utilizes a decoupled microservices architecture designed for high availability and automated deployments:

* **Frontend Hosting:** React/Vite SPA hosted on **AWS S3** and globally distributed via **Amazon CloudFront** CDN for sub-100ms load times.
* **Backend Compute:** Express.js Node API containerized via Docker, stored in **Amazon ECR**, and orchestrated using **Amazon ECS (Fargate)** for serverless container management.
* **Database:** Serverless PostgreSQL hosted on **Supabase** with connection pooling (Prisma).
* **CI/CD Pipeline:** Automated testing, Docker image building, and zero-downtime ECS deployments managed by **GitHub Actions**.

```text
Momentum/
│
├── .github/
│   └── workflows/
│       ├── aws-deploy.yml       # CI/CD: Builds Docker & deploys to ECS/S3
│
├── frontend/                    # Vite + React Client
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Reusable UI & Recharts components
│   │   │   └── pages/           # Route-level views
│   │   └── main.tsx             # Auth0 Provider & DOM injection
│   └── package.json
│
└── backend/                     # Express + Prisma API
    ├── prisma/
    │   └── schema.prisma        # Postgres Schema
    ├── src/
    │   ├── controllers/         # LLM & CRUD logic
    │   ├── middleware/          # Auth0 JWT validation
    │   └── app.ts               # Server initialization
    ├── Dockerfile               # Production container definition
    └── package.json


Local Development Setup
1. Clone the repository

Bash
git clone [https://github.com/YourUsername/Momentum.git](https://github.com/YourUsername/Momentum.git)
cd Momentum
2. Setup Backend

Bash
cd backend
npm install
# Create a .env file with DATABASE_URL, DIRECT_URL, and GEMINI_API_KEY
npx prisma generate
npm run dev
3. Setup Frontend

Bash
cd frontend
npm install
# Create a .env file with VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE
npm run dev