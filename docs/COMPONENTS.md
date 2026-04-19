# UniHelp — Frontend Component Guide

> Key React components, their props, and responsibilities.

---

## Page Components (`src/pages/`)

### `RoadmapsPage.jsx`
Main page for roadmap management.

**State:**
- `roadmaps[]` — list of user's roadmaps
- `activeRoadmap` — currently open roadmap (switches to builder view)
- `showGenerateModal` — AI generation dialog
- `isGenerating` — loading state during AI call
- `generationError` — error message displayed in modal

**Key handlers:**
- `handleGenerateMap()` — calls `generateRoadmapAI(goal)`, opens the generated roadmap
- `handleDelete(id)` — deletes a roadmap with confirmation
- `handleCreateNew()` — creates a blank roadmap

**URL integration:** Accepts `?todoObjective=...` query param to pre-fill the goal from a Todo.

---

### `ProfilePage.jsx`
Full professional profile editor.

Sections: Personal Info, Education, Work Experience, Projects, Technical Skills, Soft Skills, Certifications, Languages.

Each section is independently editable and saved via `PATCH /api/profile/:section`.

---

### `InterviewPrepPage.jsx`
Mock interview interface.

- **HR mode:** Conversational chat-style interview
- **Technical mode:** Quiz with scored answers

Integrates with `hrInterviewChain` and `technicalInterviewChain` on the backend.

---

### `ProfileCritiquePage.jsx`
Displays AI critique of the user's profile with:
- Score (0–100)
- Strengths list
- Weaknesses list
- Actionable suggestions
- "Add to todos" button per suggestion

---

### `JobApplicationsPage.jsx`
Kanban-style or table view of job applications with status management.

---

### `GenerateCVPage.jsx`
Two-mode CV generator:
1. **Full profile** → generates LaTeX from complete profile
2. **Auto-fill** → paste job description → AI extracts skills/requirements → generates tailored CV

Includes LaTeX preview and copy/download buttons.

---

### `CommunityRoadmapsPage.jsx`
Browse public roadmaps shared by other users.
- Like/unlike
- Clone to your account
- Filter by topic

---

### `DashboardHome.jsx`
Overview cards: application count by status, recent activity, quick links.

---

## Roadmap Components (`src/components/roadmap/`)

### `RoadmapBuilder.jsx`
The main React Flow canvas.

**Props:**
```js
{
  roadmap: Roadmap,      // full roadmap document from MongoDB
  onBack: () => void     // called when user clicks "Back"
}
```

**Features:**
- Renders `nodes` with `customNode` type
- Renders `edges` with `customEdge` type (animated)
- `fitView` on load
- Node click → opens detail panel
- Back button → calls `onBack()`
- Saves node status changes via `PUT /api/roadmaps/:id`

---

### `nodes/RoadmapNode.jsx` (CustomNode)
Visual card rendered for each roadmap node.

**Data props (from `node.data`):**
```js
{
  label: string,
  description: string,
  status: 'pending' | 'in-progress' | 'completed',
  resources: Resource[],
  tools: Tool[],
  xpReward: number
}
```

**Visual states:**
- 🔘 `pending` — grey border
- 🔵 `in-progress` — blue border + pulse animation
- ✅ `completed` — green border + checkmark

---

### `edges/CustomEdge.jsx`
Animated SVG edge connecting two nodes.
Uses `animated: true` from the edge data to apply a dash-flow animation.

---

## API Layer (`src/api/`)

### `axios.js`
Shared axios instance:
- `baseURL`: `VITE_API_URL` or `http://localhost:5000/api`
- Request interceptor: attaches `Authorization: Bearer <token>` from localStorage
- Response interceptor: auto-refreshes token on 401, redirects to `/login` on refresh failure

### `roadmapService.js`

| Function | Method | Endpoint |
|---|---|---|
| `getRoadmaps()` | GET | `/roadmaps` |
| `getRoadmapById(id)` | GET | `/roadmaps/:id` |
| `generateRoadmapAI(goalData)` | POST | `/roadmaps/generate` |
| `updateRoadmap(id, data)` | PUT | `/roadmaps/:id` |
| `deleteRoadmap(id)` | DELETE | `/roadmaps/:id` |
| `generateNodeContent(id, nodeId)` | POST | `/roadmaps/:id/nodes/:nodeId/generate` |
| `getPublicRoadmaps()` | GET | `/roadmaps/public/all` |
| `cloneRoadmap(id)` | POST | `/roadmaps/:id/clone` |
| `toggleRoadmapVisibility(id)` | PATCH | `/roadmaps/:id/visibility` |
| `likeRoadmap(id)` | POST | `/roadmaps/:id/like` |
| `generateStudySchedule(id, data)` | POST | `/roadmaps/:id/schedule/generate` |
| `getStudySchedule(id)` | GET | `/roadmaps/:id/schedule` |
| `toggleScheduleTask(id, taskId)` | PATCH | `/roadmaps/:id/schedule/tasks/:taskId/toggle` |

---

## Context (`src/context/`)

### `AuthContext.jsx`
Global authentication state.

**Provides:**
```js
{
  user: User | null,
  login: (credentials) => Promise<void>,
  logout: () => void,
  isAuthenticated: boolean,
  loading: boolean
}
```

Used by all protected pages and the axios interceptor.
