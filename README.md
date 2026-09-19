# AI ATS Resume Optimizer

> **Upload Resume → ATS Score → Analyze Role/Job Description → Match Resume with Role → AI Resume Editor → Improve ATS Score → Download Optimized Resume**

AI ATS Resume Optimizer is an enterprise-grade platform designed to evaluate resumes against modern Applicant Tracking Systems (ATS), extract and parse job description requirements, match skills without hallucination or fabrication, edit resumes interactively in an A4 live editor, improve ATS scores, and export ATS-compliant resumes.

---

## 🌟 Core Product Workflow

```text
UPLOAD RESUME
     ↓
ATS SCORE & DIAGNOSTIC
     ↓
ANALYZE ROLE / JOB DESCRIPTION
     ↓
MATCH RESUME WITH ROLE (Skill & Keyword Alignment)
     ↓
AI RESUME EDITOR (Live 3-Panel Interactive Editor)
     ↓
IMPROVE ATS SCORE
     ↓
DOWNLOAD OPTIMIZED RESUME (A4 PDF / DOCX / TXT)
```

---

## 🏗️ Project Architecture

The application is structured into three dedicated tiers:

- **`client/`**: React 18 + Vite frontend with vanilla CSS design system and Lucide React icons.
- **`server/`**: Node.js + Express backend providing authentication, database persistence, and application APIs.
- **`ai-service/`**: Python + FastAPI microservice dedicated to ATS parsing, semantic extraction, and scoring algorithms.

```text
ai_ats_resume_optimizer/
├── client/          # Frontend application (React, Vite)
├── server/          # Backend application API (Express, Mongoose)
├── ai-service/      # AI/NLP Microservice (Python, FastAPI)
├── .env.example     # Environment variables blueprint
├── .gitignore       # Git ignore rules
└── package.json     # Workspace management scripts
```

### 🛡️ The Anti-Fabrication Guarantee
Traditional AI resume generators often hallucinate skills, metrics, degrees, or companies you never worked at. **ResumeAI strictly forbids this.**
* Every AI suggestion is tagged as `SUPPORTED`, `PARTIALLY_SUPPORTED`, or `UNSUPPORTED`.
* If a target job requires **AWS** or **Kubernetes** and it is not present in the user's verified Master Profile, the system flags it as **`MISSING`**.
* It **never** fabricates fake experience into the candidate's resume.

---

## 🚀 Key Features

1. **Master Profile (Source of Truth)**: Centralized repository of verified personal details, professional summary, education, categorized technical skills, experience with achievements, projects, certifications, and languages.
2. **Visual Resume Builder (3-Pane Live A4 Preview)**:
   - Left: Content controls and section editors.
   - Center: Live A4 sheet preview with zoom controls (0.5x - 1.3x), fit to screen, and print stylesheet.
   - Right: Template switcher, typography font selector, page margins, and accent color.
3. **6 Professional ATS-Safe Templates**:
   - **ATS Classic**: Single-column strict hierarchy for legacy enterprise parsers (Workday, Taleo).
   - **Modern Professional**: Balanced typography with subtle corporate divider lines.
   - **Software Engineer**: Technical competencies and project repositories prioritized.
   - **Fresh Graduate**: Academic accomplishments, degrees, and coursework emphasized.
   - **Minimal**: High-contrast typography maximizing whitespace and scan readability.
   - **Executive**: Strategic leadership summary and business impact metrics.
4. **AI Job Description Analyzer**: Paste text or upload PDF/DOCX/TXT files to extract categorized requirements (`Required`, `Preferred`, `Optional`), action verbs, and domain keywords.
5. **Transparent 7-Category ATS Scoring Engine**:
   - Keyword Relevance (25%)
   - Technical Skills Match (20%)
   - Job Relevance (15%)
   - Standard Structure (10%)
   - Section Completeness (10%)
   - Readability & Action Verbs (10%)
   - Formatting & Parseability (10%)
6. **Resume Version Manager & Diff**: Keep distinct versions for different companies without overwriting your master profile. Visually compare differences with the built-in diff viewer.
7. **Skill Gap & Structured Learning Roadmaps**: Classifies missing capabilities (`Critical`, `Important`, `Nice to have`) and provides realistic learning roadmaps with prerequisites, topics, and practical projects.
8. **Interview Preparation & Elevator Pitches**: Generates role-specific technical and behavioral questions grounded in your real projects, plus 30s, 60s, and 90s self-introduction elevator pitches.
9. **Job Application Pipeline Tracker**: Kanban and list view to track statuses (`Saved`, `Applied`, `Online Assessment`, `Interview`, `Offer`, `Rejected`) alongside the exact resume used and ATS match score.
10. **Multi-Format Export**: Download pixel-perfect A4 PDF, structured Word `.docx` documents, or plain `.txt` files.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, JSX, Modular Vanilla CSS (Strictly no Tailwind, adhering to custom 8px spacing system and curated SaaS palette), Lucide React, Recharts.
- **Backend**: Node.js, Express.js REST API, JWT Authentication, bcryptjs password hashing, Multer for file uploads, `docx` for Word document generation, `pdf-parse` & `mammoth` for document parsing.
- **Database**: MongoDB & Mongoose. Includes zero-configuration `mongodb-memory-server` fallback for instantaneous local evaluation.
- **AI Service Layer**: Pluggable AI engine compatible with Google Gemini API, OpenAI-compatible endpoints, or high-precision local deterministic heuristics for offline/demo use.

---

## 📂 Project Structure

```text
ai_ats_resume_optimizer/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── resume/          # A4ResumeDocument & print styling
│   │   ├── context/             # AuthContext & ToastContext
│   │   ├── layouts/             # PublicLayout & DashboardLayout (11-item sidebar)
│   │   ├── pages/
│   │   │   ├── public/          # LandingPage, LoginPage, RegisterPage
│   │   │   └── dashboard/       # Overview, Profile, Resumes, Builder, Analyzer, Optimizer, ATS, Skills, Applications, Interview, Settings
│   │   ├── services/            # Axios API client with JWT interceptor
│   │   ├── styles/              # variables.css (design tokens) & global.css
│   │   ├── App.jsx              # Application router & protected routes
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/                  # db.js (Dual-mode MongoDB) & atsConfig.js (Scoring Rubric)
│   ├── controllers/             # auth, profile, resume, job, matching, ats, skills, interview, application, analytics
│   ├── middleware/              # JWT auth, error handler, multer upload validation
│   ├── models/                  # User, Profile, Resume, ResumeVersion, Job, JobAnalysis, Application, Activity
│   ├── routes/                  # Express REST routes
│   ├── services/
│   │   ├── ai/                  # aiClient, jobAnalyzer, resumeOptimizer, atsAnalyzer, interviewGenerator, skillGapAnalyzer
│   │   ├── export/              # docxExporter (ATS Word generation)
│   │   ├── matching/            # semantic synonym & requirement matching engine
│   │   └── parser/              # pdf-parse & mammoth document reader
│   ├── test/                    # e2eTest.js automated test suite
│   ├── app.js                   # Express application setup & static client hosting
│   ├── server.js                # Server entry point
│   └── package.json
├── package.json                 # Root orchestration scripts
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js v18+ (tested on Node v22.17.0)
- npm v9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Ezhilmaran06/ai_ats_resume_optimizer.git
cd ai_ats_resume_optimizer

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Port number for Express API server | `5000` | Optional (default 5000) |
| `CLIENT_URL` | Frontend URL for CORS and redirects | `http://localhost:5173` | Recommended |
| `MONGODB_URI` | MongoDB connection string (local or Atlas) | `mongodb://localhost:27017/ai_ats_resume_optimizer` | Required in prod (in-memory fallback in dev) |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your_jwt_secret_min_32_chars` | Required in prod |
| `AI_SERVICE_URL` | Microservice URL for Python FastAPI ATS engine | `http://localhost:8000` | Optional (fallback to local engine) |
| `AI_API_KEY` | External LLM API key (Google Gemini or OpenAI) | *(Your LLM API Key)* | Optional |
| `AI_MODEL` | AI model identifier | `gemini-1.5-flash` | Optional |

> **Security Note**: Never commit actual `.env` files or credentials to git. The application runs automatic environment validation on startup via `server/config/validateEnv.js`.

### 3. Run the Application
In development, start the backend and frontend simultaneously:

**Terminal 1 (Backend):**
```bash
cd server
npm start
```
*The server will start on `http://localhost:5000`. If local MongoDB is not running, it gracefully initializes an in-memory database automatically.*

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
*The client will start on `http://localhost:5173` with full hot-reloading and proxying to port 5000.*

---

## 🧪 Testing the Complete Flow

1. Open `http://localhost:5173`.
2. On the **Login** page, click the **"Sign in as Demo User (1-Click)"** button.
3. In **My Profile**, inspect or customize verified experiences and skills, or click **"Load Sample Profile"**.
4. Navigate to **Job Analyzer** and click **"Load Sample Cloud Engineer JD"** to run instant requirement extraction.
5. Head to **Resume Optimizer**: observe the calculated match percentage and generated suggestions tagged with Anti-Fabrication badges (`SUPPORTED`).
6. Click **"Accept All Supported"** and **"Apply Accepted Changes"**.
7. In **ATS Analyzer**, review the 7-category gauge score and actionable recommendations.
8. Explore **Skill Gap** for step-by-step learning roadmaps and **Interview Prep** for 30s/60s/90s pitches.
9. In **Resume Builder**, customize fonts, margins, or export as **PDF**, **DOCX**, or **TXT**.

### Running Automated E2E Tests
To run the automated backend test suite covering all 10 core modules:
```bash
node server/test/e2eTest.js
```

---

## 🔒 Security & Privacy
- Zero client-side storage of confidential LLM keys.
- Input validation on all endpoints with sanitized file parsing.
- Password encryption with standard bcrypt salt rounds.
- Stateless JSON Web Tokens (JWT) for authenticated requests.
- Machine-parseable ATS exports free from hidden tracking pixels or metadata leakage.

---

## 📄 License
This project is licensed under the MIT License.
