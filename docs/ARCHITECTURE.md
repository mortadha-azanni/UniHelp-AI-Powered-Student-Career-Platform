# UniHelp — Architecture Overview

> System design, AI pipeline, and key patterns used in the project.

---

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      BROWSER                             │
│         React 19 + Vite  (http://localhost:5173)         │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTPS / Axios (JWT Bearer)
┌────────────────────▼─────────────────────────────────────┐
│                  EXPRESS 5 SERVER (port 5000)             │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Routes   │→ │ Controllers  │→ │ Mongoose Models │  │
│  └────────────┘  └──────┬───────┘  └────────┬────────┘  │
│                         │ AI needed?         │            │
│                  ┌──────▼───────┐            │            │
│                  │  LangChain   │        MongoDB Atlas    │
│                  │  AI Service  │                         │
│                  └──────┬───────┘                         │
└─────────────────────────┼───────────────────────────────-┘
                          │
          ┌───────────────┼──────────────────┐
          ▼               ▼                  ▼
   Google Gemini    Google Gemini      OpenRouter
   (Primary Key)   (Backup Key)   (Fallback — always on)
```

---

## 2. Backend Structure

```
server/
├── index.js               Entry point — starts HTTP server
├── app.js                 Express app, CORS, middleware, routes
├── controllers/           Business logic per domain
│   ├── authController.js
│   ├── profileController.js
│   ├── roadmapController.js   ← Main AI pipeline controller
│   ├── cvController.js
│   ├── cvAutoFillController.js
│   ├── todosController.js
│   └── jobApplicationsController.js
├── models/                Mongoose schemas
│   ├── User.js
│   ├── Profile.js
│   ├── Roadmap.js
│   ├── StudySchedule.js
│   ├── CV.js
│   ├── Todo.js
│   └── JobApplication.js
├── routes/                Express routers (mounted under /api/...)
│   ├── auth.js
│   ├── profile.js
│   ├── roadmap.js
│   ├── cv.js
│   └── ...
├── services/              LangChain AI chains (9 total)
│   ├── roadmapGeneratorChain.js
│   ├── studyScheduleChain.js
│   ├── roadmapNodeChain.js
│   ├── cvChain.js
│   ├── cvAutoFillChain.js
│   ├── profileCritiqueChain.js
│   ├── hrInterviewChain.js
│   ├── technicalInterviewChain.js
│   └── technicalQuizChain.js
└── middleware/
    └── auth.js            JWT verification
```

---

## 3. AI Roadmap Generation Pipeline

This is the most complex feature. When `POST /api/roadmaps/generate` is called:

```
[Request] goal + JWT
    ↓
[Controller] fetch user Profile from MongoDB
    ↓
[AI Chain] 3-tier provider fallback:
    1. Google Gemini 2.5 Flash (primary key)   → if quota: continue
    2. Google Gemini 2.5 Flash (backup key)    → if quota: continue
    3. OpenRouter → google/gemini-2.5-flash    → if fail: throw
    ↓
[Parser] Zod schema validates JSON output
    ↓
[Controller] transform nodes → React Flow format
    ↓
[Edge Rebuild] merge AI edges + prerequisite-derived edges (deduplicated)
    ↓
[Dagre Layout] compute (x,y) positions — rankdir:TB, ranksep:180, nodesep:120
    ↓
[MongoDB] save complete Roadmap document
    ↓
[Response] full roadmap JSON → frontend renders in React Flow
```

### Why edges are rebuilt from prerequisites

The AI's `edges[]` array tends to be simplified (often a linear chain).
The `prerequisites[]` field on each node correctly encodes the full branching DAG.
The controller always rebuilds edges from prerequisites and merges with AI edges.

---

## 4. Authentication Flow

```
Login → POST /api/auth/login
  ← accessToken (15 min, in JSON body)     → stored in localStorage
  ← refreshToken (7 days, httpOnly cookie) → stored in browser cookie

Every request → Authorization: Bearer <accessToken>

On 401 → axios interceptor auto-calls POST /api/auth/refresh
  ← new accessToken → retries original request transparently

Logout → DELETE /api/auth/logout → clears cookie
```

---

## 5. LangChain Pattern

All AI chains follow the same pattern:

```js
const parser  = StructuredOutputParser.fromZodSchema(schema);
const prompt  = new PromptTemplate({ template, inputVariables, partialVariables });
const model   = new ChatGoogleGenerativeAI({ model: 'gemini-2.5-flash', apiKey });
const chain   = prompt.pipe(model).pipe(parser);
const result  = await chain.invoke({ ...inputs });
```

All models use **lazy initialization** (created inside the async function) to avoid startup crashes when the API key is missing at module load time.

---

## 6. Frontend Architecture

```
client/src/
├── api/                   One file per domain (axios calls)
│   ├── axios.js           Shared axios instance + interceptors
│   ├── roadmapService.js
│   ├── cvsApi.js
│   └── ...
├── components/
│   └── roadmap/
│       ├── RoadmapBuilder.jsx    React Flow canvas
│       ├── nodes/RoadmapNode.jsx Custom node renderer
│       └── edges/CustomEdge.jsx  Animated edges
├── context/
│   └── AuthContext.jsx    Global auth state
└── pages/
    ├── RoadmapsPage.jsx
    ├── ProfilePage.jsx
    ├── InterviewPrepPage.jsx
    └── ...
```

---

## 7. Data Flow Summary

```
User Action → React Page → api/service.js → axios → Express Route
→ Controller → Mongoose Model ↔ MongoDB Atlas
                ↓ (if AI needed)
            LangChain Service → Gemini / OpenRouter
                ↓
            Structured JSON (Zod validated)
                ↓
            Controller processes, saves, responds
                ↓
React re-renders with new data
```
