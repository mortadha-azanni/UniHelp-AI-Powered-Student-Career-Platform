# UniHelp — Database Schema

> All collections use MongoDB via Mongoose. Below are the key schemas.

---

## User

```js
{
  _id: ObjectId,
  username: String (required, unique),
  email:    String (required, unique),
  password: String (bcrypt hashed),
  role:     String (default: 'student'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Profile

One profile per user. Used by all AI features to personalize output.

```js
{
  _id: ObjectId,
  user: ObjectId → User,

  personalInfo: {
    fullName: String,
    title: String,          // e.g. "Full-Stack Developer"
    email: String,
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    github: String,
    summary: String
  },

  education: [{
    school: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    grade: String,
    description: String
  }],

  workExperience: [{
    company: String,
    position: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String,
    technologies: [String]
  }],

  projects: [{
    name: String,
    description: String,
    technologies: [String],
    url: String,
    githubUrl: String,
    startDate: Date,
    endDate: Date
  }],

  technicalSkills: [{
    name: String,
    level: String   // 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }],

  softSkills: [String],

  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    credentialUrl: String
  }],

  languages: [{
    name: String,
    level: String   // 'A1' … 'C2' | 'native'
  }],

  createdAt: Date,
  updatedAt: Date
}
```

---

## Roadmap

```js
{
  _id: ObjectId,
  user: ObjectId → User,

  title: String,
  description: String,
  category: String,         // 'AI Generated' | user-defined
  difficulty: String,       // 'Beginner' | 'Intermediate' | 'Advanced'
  isPublic: Boolean,        // community roadmaps
  likes: [ObjectId],        // user IDs who liked

  // React Flow graph data
  nodes: [{
    id: String,             // unique node id (e.g. 'node-1')
    type: String,           // 'customNode'
    position: { x: Number, y: Number },
    data: {
      label: String,
      description: String,
      status: String,       // 'pending' | 'in-progress' | 'completed'
      resources: [{
        title: String,
        url: String,
        type: String        // 'documentation' | 'video' | 'article'
      }],
      tools: [{
        name: String,
        type: String
      }],
      xpReward: Number
    }
  }],

  edges: [{
    id: String,
    source: String,         // source node id
    target: String,         // target node id
    type: String,           // 'customEdge'
    animated: Boolean
  }],

  progress: {
    totalNodes: Number,
    completedNodes: Number,
    percentage: Number       // 0–100
  },

  clonedFrom: ObjectId,     // if cloned from community

  createdAt: Date,
  updatedAt: Date
}
```

---

## StudySchedule

One schedule per roadmap per user.

```js
{
  _id: ObjectId,
  user: ObjectId → User,
  roadmap: ObjectId → Roadmap,

  days: [{
    dayNumber: Number,
    focusArea: String,
    tasks: [{
      _id: ObjectId,
      nodeId: String,        // matches a Roadmap node id
      taskDescription: String,
      estimatedMinutes: Number,
      completed: Boolean
    }]
  }],

  progress: Number,          // 0–100

  createdAt: Date,
  updatedAt: Date
}
```

---

## CV

```js
{
  _id: ObjectId,
  user: ObjectId → User,
  jobApplication: ObjectId → JobApplication (optional),

  title: String,
  latexCode: String,         // full LaTeX source
  generatedDate: Date,

  createdAt: Date,
  updatedAt: Date
}
```

---

## JobApplication

```js
{
  _id: ObjectId,
  user: ObjectId → User,

  company: String,
  position: String,
  status: String,   // 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  applicationDate: Date,
  interviewDate: Date,
  salary: String,
  location: String,
  url: String,
  notes: String,
  linkedCV: ObjectId → CV,

  createdAt: Date,
  updatedAt: Date
}
```

---

## Todo

```js
{
  _id: ObjectId,
  user: ObjectId → User,
  linkedApplication: ObjectId → JobApplication (optional),

  title: String,
  completed: Boolean,
  priority: String,    // 'low' | 'medium' | 'high'
  dueDate: Date,
  category: String,   // 'skill-gap' | 'follow-up' | 'learning' | 'other'

  createdAt: Date,
  updatedAt: Date
}
```

---

## Relationships Diagram

```
User ──────────────────────────────────────────────┐
 │                                                  │
 ├── Profile (1:1)                                  │
 │                                                  │
 ├── Roadmap (1:N)                                  │
 │     └── StudySchedule (1:1 per roadmap)          │
 │           └── Days → Tasks (ref nodeId in Roadmap)│
 │                                                  │
 ├── CV (1:N)                                       │
 │     └── optionally linked to JobApplication      │
 │                                                  │
 ├── JobApplication (1:N)                           │
 │     └── optionally linked to CV                  │
 │                                                  │
 └── Todo (1:N)                                     │
       └── optionally linked to JobApplication      │
                                                    │
 Roadmap.likes → [User._id, ...]   (N:M via array) ─┘
```
