# 🧠 FlowMind OS — productivity tracking that predicts your next move

FlowMind OS tracks which apps and windows you work in, classifies time as productive or distracting, and uses a **Markov‑chain model** to predict which app you'll switch to next — with a plain‑English explanation of *why*.

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?logo=springboot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-tracker-3776AB?logo=python&logoColor=white)

## Architecture

```
┌──────────────┐   activity events   ┌─────────────────────┐   REST/JSON   ┌──────────────────┐
│  tracker.py  │ ──────────────────► │  Spring Boot API    │ ◄───────────► │  Next.js 14 UI   │
│ (Python, OS  │                     │  :8080              │               │  dashboard,      │
│  window poll)│                     │  controllers →      │               │  timeline,       │
└──────────────┘                     │  services →         │               │  analytics,      │
                                     │  strategy pattern   │               │  insights, chat  │
                                     └─────────────────────┘               └──────────────────┘
```

- **Tracker (Python)** — polls the active window every 5 s on Windows / macOS / Linux and posts sessions to the backend.
- **Backend (Spring Boot 3, Java 17)** — controllers for auth, activity, timeline, analytics, automation and chat. Prediction uses the **Strategy pattern** (`PredictionStrategy` → `MarkovPredictionStrategy`) so new models can be swapped in.
- **Frontend (Next.js 14 + Tailwind + Recharts + Framer Motion)** — dashboard, timeline, analytics, insights and settings pages.

## Key features

- Productive vs. distracting time, per app and per hour
- Next‑app prediction with probability and explanation, e.g. *"From 40 switches from VS Code, Chrome followed 26 times (65%)"*
- Timeline of every session
- Automation rules and an AI chat assistant (optional, needs an API key)

## Run it locally

```bash
# 1. Backend
mvn spring-boot:run                     # starts on http://localhost:8080

# 2. Frontend
cd frontend
npm install
npm run dev                             # http://localhost:3000

# 3. Tracker (separate terminal)
pip install psutil requests
python tracker.py <username> <password>
```

Optional: set `ANTHROPIC_API_KEY` as an environment variable to enable the chat assistant.

## Project structure

```
src/main/java/com/flowmind/
├── controller/   REST endpoints
├── service/      business logic (analytics, workflow, automation, chat)
├── strategy/     prediction strategies (Markov)
└── model/        domain objects
frontend/         Next.js app (app router)
tracker.py        desktop activity tracker
```

---

Built by [Hiten Mandhyan](https://github.com/Hit3nDev)
