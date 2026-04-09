# Provn 🎯

**Skill-based learning platform connecting students with industry-verified tasks**

Provn is a modern learning platform that bridges the gap between academic knowledge and industry requirements. Students complete real-world tasks, get verified by industry professionals, and build a credible portfolio.

Contact: hello@provn.live and support@provn.live.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)

---

## ✨ Features

### 🎓 For Students
- **Interactive Roadmaps** — Visual skill trees built with React Flow
- **Task Marketplace** — Real-world challenges from platform and industry
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
| **Database** | Supabase (PostgreSQL + Auth) |
| **Visualization** | React Flow (@xyflow/react) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Analytics** | PostHog |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/provn.git
   cd provn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # YouTube API (optional - for course suggestions)
   YOUTUBE_API_KEY=your_youtube_api_key
   
   # PostHog Analytics (optional)
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run these SQL files in your Supabase SQL Editor (in order):
   ```
   supabase/skills_schema.sql    # Creates skills table
   supabase/seed_roadmaps.sql    # Seeds sample data (optional)
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
provn/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Role-based dashboards
│   │   ├── student/       # Student dashboard
│   │   ├── industry/      # Industry partner dashboard
│   │   ├── college/       # College admin dashboard
│   │   └── admin/         # Platform admin dashboard
│   ├── discover/          # Browse roadmaps
│   ├── roadmap/[id]/      # Interactive roadmap view
│   ├── tasks/             # Task marketplace
│   ├── portfolio/[id]/    # Public portfolio page
│   ├── simulator/         # Code simulator
│   └── onboarding/[role]/ # Role-specific onboarding
├── components/            # Reusable UI components
│   ├── roadmap/          # React Flow components
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Badge.jsx
│   └── ...
├── lib/
│   └── actions/          # Server Actions
│       ├── roadmaps.js   # Roadmap CRUD
│       ├── tasks.js      # Task management
│       ├── submissions.js # Submission handling
│       ├── scores.js     # Score calculations
│       ├── roadmapFlow.js # React Flow data
│       └── youtube.js    # YouTube API integration
├── utils/
│   └── supabase/         # Supabase client setup
├── supabase/             # SQL schemas and seeds
└── middleware.js         # Auth & role-based routing
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User profiles with roles (student, industry, college, admin) |
| `roadmaps` | Learning paths with title and description |
| `skills` | Individual skills within roadmaps |
| `tasks` | Challenges linked to skills with points |
| `submissions` | Student work submissions with status |

### Key Relationships

```
roadmaps (1) ──── (n) skills
skills   (1) ──── (n) tasks
tasks    (1) ──── (n) submissions
users    (1) ──── (n) submissions
```

---

## 🔐 Authentication & Roles

Provn uses Supabase Auth with role-based access control:

| Role | Access |
|------|--------|
| **Student** | View roadmaps, submit tasks, track progress |
| **Industry** | Create tasks, review submissions, view leaderboard |
| **College** | Monitor student progress, view analytics |
| **Admin** | Full platform access |

Middleware automatically redirects users to their role-specific dashboard.

---

## 🎯 Roadmap Feature

The interactive roadmap uses **React Flow** for visualization:

- **Nodes** = Skills (clickable to view tasks)
- **Edges** = Learning progression path
- **Colors** = Completion status (pending → in-progress → completed)
- **Side Panel** = Tasks list + YouTube recommendations

---

## 📊 Analytics

PostHog integration provides:
- Page view tracking
- User identification by role
- Custom event tracking
- Feature flag support

---

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [React Flow](https://reactflow.dev/) for the roadmap visualization
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling

---

<p align="center">
  Built with ❤️ for learners and industry partners
</p>
