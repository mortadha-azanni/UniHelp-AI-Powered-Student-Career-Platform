# UniHelp — API Reference

> Base URL: `http://localhost:5000/api`
> All protected routes require `Authorization: Bearer <accessToken>` header.

---

## Authentication

### `POST /auth/register`
Register a new user account.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
**Response:** `201` `{ success, data: { user, accessToken } }` + sets refresh cookie

---

### `POST /auth/login`
**Body:** `{ email, password }`
**Response:** `200` `{ success, data: { user, accessToken } }` + sets refresh cookie

---

### `POST /auth/refresh`
Refresh the access token using the httpOnly refresh cookie.
**Response:** `200` `{ success, data: { accessToken } }`

---

### `POST /auth/logout`
**Response:** `200` — clears refresh token cookie

---

### `GET /me`
Get the currently authenticated user.
**Response:** `200` `{ success, data: { _id, username, email } }`

---

## Profile

### `GET /profile`
Get the logged-in user's profile.
**Response:** `200` `{ success, data: Profile }`

---

### `PUT /profile`
Replace the entire profile.
**Body:** Full Profile object (see DATABASE.md for schema)
**Response:** `200` `{ success, data: Profile }`

---

### `PATCH /profile/:section`
Update a specific section of the profile.
**Params:** `section` = `personalInfo` | `education` | `workExperience` | `projects` | `skills` | `certifications` | `languages`
**Body:** The new value for that section
**Response:** `200` `{ success, data: Profile }`

---

## Roadmaps

### `POST /roadmaps/generate` ⭐ AI
Generate a personalized roadmap using AI.

**Body:**
```json
{ "goal": "Learn Penetration Testing" }
```

**Response:** `201`
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Penetration Testing Mastery Roadmap",
    "nodes": [...],   // React Flow nodes with (x,y) positions
    "edges": [...],   // React Flow edges
    "progress": { "totalNodes": 15, "completedNodes": 0, "percentage": 0 }
  }
}
```

> AI uses 3-tier fallback: Google primary → Google backup → OpenRouter

---

### `GET /roadmaps`
List all roadmaps belonging to the current user.
**Response:** `200` `{ success, count, data: Roadmap[] }`

---

### `GET /roadmaps/:id`
Get a single roadmap by ID.
**Response:** `200` `{ success, data: Roadmap }`

---

### `PUT /roadmaps/:id`
Update a roadmap (title, nodes, edges, etc.).
**Body:** `{ title?, description?, nodes?, edges? }`
**Response:** `200` `{ success, data: Roadmap }`

---

### `DELETE /roadmaps/:id`
Delete a roadmap.
**Response:** `200` `{ success, message }`

---

### `POST /roadmaps/:id/nodes/:nodeId/generate` ⭐ AI
Generate detailed content (description, resources) for a specific node.
**Response:** `200` `{ success, data: updatedNode }`

---

### `GET /roadmaps/public/all`
List all public community roadmaps.
**Response:** `200` `{ success, count, data: Roadmap[] }`

---

### `POST /roadmaps/:id/clone`
Clone a public roadmap to your account.
**Response:** `201` `{ success, data: Roadmap }`

---

### `PATCH /roadmaps/:id/visibility`
Toggle a roadmap between public and private.
**Response:** `200` `{ success, data: Roadmap }`

---

### `POST /roadmaps/:id/like`
Like or unlike a public roadmap.
**Response:** `200` `{ success, likesCount, data: Roadmap }`

---

## Study Schedule

### `POST /roadmaps/:id/schedule/generate` ⭐ AI
Generate an AI daily study schedule based on a roadmap.

**Body:**
```json
{
  "hoursPerDay": 2,
  "targetTimeframe": "3 months",
  "familiarityLevel": "beginner"
}
```
**Response:** `200` `{ success, data: StudySchedule }`

---

### `GET /roadmaps/:id/schedule`
Get the study schedule for a roadmap.
**Response:** `200` `{ success, data: StudySchedule }`

---

### `PATCH /roadmaps/:id/schedule/tasks/:taskId/toggle`
Toggle a schedule task as completed/incomplete. Auto-syncs roadmap node status.
**Response:** `200` `{ success, data: StudySchedule }`

---

## CVs

### `POST /cvs/generate` ⭐ AI
Generate a CV from the user's full profile.
**Body:** `{ jobApplicationId? }` (optional — links CV to application)
**Response:** `200` `{ success, data: { latex } }`

---

### `POST /cvs/autofill` ⭐ AI
Auto-fill profile fields from a job description, then generate a tailored CV.
**Body:** `{ jobDescription: "..." }`
**Response:** `200` `{ success, data: { latex } }`

---

### `GET /cvs`
List all saved CVs.
**Response:** `200` `{ success, data: CV[] }`

---

### `GET /cvs/:id`
Get a single saved CV.
**Response:** `200` `{ success, data: CV }`

---

### `DELETE /cvs/:id`
Delete a saved CV.
**Response:** `200` `{ success, message }`

---

## Job Applications

### `GET /job-applications`
List all job applications.
**Response:** `200` `{ success, count, data: JobApplication[] }`

---

### `POST /job-applications`
Create a new job application.
**Body:** `{ company, position, status, applicationDate, notes?, url?, interviewDate? }`
**Response:** `201` `{ success, data: JobApplication }`

---

### `PUT /job-applications/:id`
Update an application.
**Response:** `200` `{ success, data: JobApplication }`

---

### `DELETE /job-applications/:id`
**Response:** `200` `{ success, message }`

---

### `GET /job-applications/stats`
Get application statistics (total, by status, success rate).
**Response:** `200` `{ success, data: { total, byStatus, successRate } }`

---

### `POST /job-applications/:id/generate-quiz` ⭐ AI
Generate a technical quiz for a specific job application.
**Response:** `200` `{ success, data: { questions } }`

---

## Todos

### `GET /todos`
List all todos.
**Response:** `200` `{ success, data: Todo[] }`

---

### `POST /todos`
Create a new todo.
**Body:** `{ title, priority?, dueDate?, linkedApplicationId? }`
**Response:** `201` `{ success, data: Todo }`

---

### `PUT /todos/:id`
Update a todo.
**Response:** `200` `{ success, data: Todo }`

---

### `DELETE /todos/:id`
**Response:** `200` `{ success, message }`

---

### `POST /todos/generate-skill-gaps` ⭐ AI
Auto-generate skill-gap todos from a job application.
**Body:** `{ applicationId }`
**Response:** `201` `{ success, data: Todo[] }`

---

## Profile Critique

### `POST /profile/critique` ⭐ AI
Generate an AI critique of the user's profile.
**Response:** `200`
```json
{
  "success": true,
  "data": {
    "strengths": [...],
    "weaknesses": [...],
    "suggestions": [...],
    "score": 78
  }
}
```

---

## Interview Preparation

### `POST /interview/hr` ⭐ AI
Generate HR interview questions based on user profile and a job application.
**Body:** `{ applicationId?, message? }`
**Response:** `200` `{ success, data: { question, followUp? } }`

---

### `POST /interview/technical` ⭐ AI
Start or continue a technical interview session.
**Body:** `{ skills: [...], userAnswer? }`
**Response:** `200` `{ success, data: { question, feedback? } }`

---

## Error Responses

All errors follow this shape:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": "Technical error message (dev only)"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request / missing required field |
| `401` | Not authenticated / token expired |
| `403` | Forbidden (not owner of resource) |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Server error (check server logs) |
