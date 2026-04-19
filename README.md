# Provn 🎯

**Skill-based learning platform connecting students with industry-verified tasks**

Provn is a modern learning platform that bridges the gap between academic knowledge and industry requirements. Students complete real-world tasks, get verified by industry professionals, and build a credible portfolio.

Contact: hello@provn.live and support@provn.live.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)

---

## ✨ Features

### 🎓 For Students
- **Interactive Roadmaps** — Visual skill trees built with React Flow
- **Task Marketplace** — Real-world challenges from platform and industry
- **Code Simulator** — Fully integrated code execution for Python, C++, Java and Javascript.
- **Progress Tracking** — Earn points, track completion, build your score
- **Portfolio Building** — Showcase verified work to employers
- **YouTube Course Integration** — Curated learning resources for each skill

### 🏢 For Industry Partners
- **Create Tasks** — Design challenges that test real skills
- **Review Submissions** — Evaluate student work with scoring & feedback
- **Talent Discovery** — Find students with verified, demonstrated abilities
- **Leaderboard Access** — See top performers across roadmaps

### 🎨 Design System
- **Neo-Brutalist UI** — Bold borders, sharp edges, striking typography
- **Fully Responsive** — Works on desktop, tablet, and mobile
- **Dark Accents** — Lime green, purple, and high-contrast palette

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Frontend** | React 19, Tailwind CSS 4 |
| **Backend** | Express.js API |
| **Database** | PostgreSQL |
| **Visualization** | React Flow (@xyflow/react) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Analytics** | PostHog |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL locally or via remote connection string

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/provn.git
   cd provn
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory for Next.js:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   YOUTUBE_API_KEY=your_youtube_api_key
   ```
   
   Create a `.env` file in the `/backend` directory for Express:
   ```env
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/provn
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   ```

4. **Set up the database**
   
   Run the schema file to initialize the SQL tables:
   ```bash
   psql -U postgres -d provn -f backend/src/db/schema.sql
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start Express Backend
   cd backend && npm run dev
   
   # Terminal 2: Start Next.js Frontend
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📚 API Documentation

The REST API is built in Express and exposes endpoints under `/api`. All endpoints except registration require JWT authentication passed automatically via cookies (`provn_access`).

### Authentication Routes (`/api/auth`)
- `POST /register`: Register a new user (student, industry, college).
- `POST /login`: Log in and receive JWT cookies.
- `POST /logout`: Clear cookies and end session.
- `GET /me`: Get current authenticated user profile.
- `PUT /profile`: Update profile info (name, branch, interests).
- `PUT /onboarding`: Update onboarding details.
- `PUT /upgrade`: Upgrade the current user to a Pro subscription.

### Roadmap Routes (`/api/roadmaps`)
- `GET /`: List all available roadmaps.
- `GET /me`: Get the currently assigned roadmap for the user.
- `GET /:id`: Fetch details of a specific roadmap.
- `POST /:id/assign`: Assign roadmap to user.
- `GET /:id/skills`: Get skills visualizing a specific roadmap path.
- `GET /:id/tasks`: Get tasks associated directly with a roadmap.

### Tasks Routes (`/api/tasks`)
- `GET /`: Get all tasks.
- `POST /`: Create a new task (Industry/Admin only).
- `GET /skill/:skillId`: Get tasks filtered by a specific skill.
- `GET /my-roadmap`: Get tasks specifically assigned to the user's roadmap.

### Submissions Routes (`/api/submissions`)
- `POST /`: Submit task work (auto-triggers AI evaluation for platform tasks). **(Pro Feature)**
- `GET /mine`: View your own submissions.
- `GET /review`: View pending submissions (Industry only).
- `PUT /:id/review`: Approve, reject or ask for revision.
- `GET /progress/:roadmapId`: Get overall task progress metrics.

### Simulator Routes (`/api/simulator`)
- `GET /challenges/:roadmapId`: List coding challenges.
- `GET /challenge/:id`: Retrieve details & test cases for challenge execution.
- `POST /attempts`: Start tracking a challenge attempt. **(Pro Feature)**
- `PUT /attempts/:id/submit`: Evaluate the submission code and score.
- `GET /readiness/:roadmapId`: Get the compiled readiness score.
- `GET /leaderboard/:roadmapId`: Top user scores on a roadmap.

### Scores Routes (`/api/scores`)
- `GET /dashboard`: Aggregate points and tasks data for the user dashboard.
- `GET /leaderboard`: Broad task-based leaderboard metrics.
- `GET /profile/:userId`: Detailed public performance profile.

### Marketplace Routes (`/api/marketplace`)
- `GET /jobs` & `GET /tasks`: Find jobs & paid gig openings (Job listings are blurred for non-pro users).
- `POST /jobs` & `POST /tasks`: Post new opportunities (Industry only).
- `POST /apply`: Apply for an active opportunity.
- `GET /applications/mine`: Check your application records.

---

## 🗄️ Database Schema

The PostgreSQL schema integrates relationships across platform features. 

### Core Tables

- `users`: User profiles with roles (`student`, `industry`, `college`, `admin`) and `subscription_tier` (`free`, `pro`). Auth features password hashing.
- `roadmaps`: Core learning paths (`title`, `description`, `curriculum`).
- `skills`: Skills linked to `roadmap_id` providing node details for React Flow maps.
- `tasks`: Actionable items attached to a roadmap or skill. Tracked by `points` and `difficulty`.
- `submissions`: Records of student work referencing `task_id`. States handle `pending`, `approved` and `needs_revision`.

### Simulator & Analytics
- `simulator_challenges`: Programming problems tied to roadmaps.
- `simulator_attempts`: Attempt logs capturing `code_submitted`, `tests_passed`, and `time_taken_seconds`.
- `readiness_scores`: Aggregated scoring model taking simulation vs task completion metrics into account.

### Marketplace (Jobs & Gigs)
- `job_postings`: Industry-created full-time/internship jobs.
- `task_openings`: Individual/milestone-based tasks with defined budgets.
- `applications`: Bridging table matching users to `job_id` or `task_opening_id`, preserving a snapshot of the student's `readiness_score_snapshot`.

---

## 🔐 Authentication & Roles

Provn uses native JWT (httpOnly cookies) with role-based access control evaluated at middleware layer:

| Role | Access |
|------|--------|
| **Student** | View roadmaps, submit tasks, execute simulator, apply to jobs. |
| **Industry** | Create tasks, review submissions, post jobs, run candidate discovery. |
| **College** | Monitor student progress, view aggregate macro-analytics. |
| **Admin** | Full platform access. |

Middleware automatically redirects users to their role-specific dashboards.

---

## 💎 Pro Features & Gating

Provn includes a freemium model where certain high-value features are restricted to **Pro** users. 
- **Skill-Gated Projects:** Normal users can view the project requirements, but they remain locked and blurred.
- **Task Submissions:** Only Pro users can submit tasks for grading and review (`POST /api/submissions`).
- **Industry Simulator:** The coding tests/simulator are disabled for free users (`POST /api/simulator/attempts`).
- **Marketplace Jobs:** While all users can see the marketplace, job listings are beautifully blurred for non-pro users to incentivize upgrades.

Access is controlled via the `requirePro` backend middleware and conditional `isPro` rendering on the frontend.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
