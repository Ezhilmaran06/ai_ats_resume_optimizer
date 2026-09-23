# AI ATS Resume Optimizer

[![Build & Tests](https://img.shields.io/badge/Build%20%26%20Tests-Passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-blue.svg)]()
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111%2B-teal.svg)]()
[![React](https://img.shields.io/badge/React-18-61dafb.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> **"Analyze your resume. Match it to the role. Improve it. Measure the ATS compatibility."**

An enterprise-grade platform engineered to simulate automated Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo), evaluate resume parseability and keyword coverage, compare candidate competencies against target job descriptions with strict anti-fabrication integrity, edit resumes live in an interactive A4 builder, recalculate ATS scores dynamically, manage tailored versions, and export compliant A4 PDF, Word DOCX, and TXT files.

---

## 🌟 Core Product Workflow

The platform strictly executes this linear end-to-end workflow:

```text
UPLOAD RESUME
     ↓
GET ATS SCORE
     ↓
SEE ISSUES
     ↓
ENTER ROLE / UPLOAD JOB DESCRIPTION
     ↓
ANALYZE ROLE
     ↓
COMPARE RESUME WITH ROLE
     ↓
AI RESUME EDITOR
     ↓
ACCEPT / REJECT AI CHANGES
     ↓
ATS SCORE IMPROVES
     ↓
SAVE NEW VERSION
     ↓
DOWNLOAD FINAL RESUME (PDF / DOCX / TXT)
```

---

## 🏗️ Architecture & System Design

The application follows a resilient 3-tier microservice architecture:

```text
                               ┌─────────────────────────────────────────┐
                               │               CLIENT TIER               │
                               │  React 18 + Vite (Vanilla Design System)│
                               │  - 3-Panel Visual Resume Editor         │
                               │  - Live A4 Canvas Preview (html2pdf.js) │
                               │  - Anti-Fabrication Change Review       │
                               │  - Real-time Debounced ATS Scoring      │
                               └────────────────────┬────────────────────┘
                                                    │ HTTP / JSON (REST)
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │             APPLICATION TIER            │
                               │        Node.js + Express.js API         │
                               │  - JWT Authentication & RBAC            │
                               │  - Multer PDF/DOCX/TXT Ingestion        │
                               │  - Version Management & Diff Engine     │
                               │  - A4 DOCX Document Generation          │
                               └──────────┬───────────────────┬──────────┘
                                          │                   │
                     MongoDB Protocol     │                   │  HTTP (REST)
                     (or Memory Fallback) │                   │  Port 8000
                                          ▼                   ▼
                 ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
                 │          DATA TIER              │   │         AI & NLP TIER           │
                 │         MongoDB 6+              │   │       Python 3 + FastAPI        │
                 │  - User Accounts                │   │  - Two-Layer ATS Scoring Engine │
                 │  - Resumes (Master & Tailored)  │   │  - Semantic Synonym Clusters    │
                 │  - Target Job Analyses          │   │  - Role Requirement Classifier  │
                 │  - Version Diffs & Audits       │   │  - Anti-Fabrication Optimizer   │
                 └─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 🛡️ Anti-Fabrication Engine & Factual Integrity

Traditional generative AI models hallucinate skills, metrics, degrees, or tools candidates never used. **AI ATS Resume Optimizer strictly prevents this**:

1. **Zero Fake Experience**: If a target job requires **Docker**, **AWS**, or **Kubernetes** and those skills do not exist in the candidate's verified profile, the engine **never** injects them into the resume text.
2. **Tri-State Skill Categorization**:
   - `Matched`: Skill is verified and matched (exact or semantic synonym).
   - `Partial`: Related competency or contextual foundation detected.
   - `Missing`: Explicitly identified as missing. Labeled with: *"Consider learning [Skill] because it is required in the job description. Do NOT pretend to have this skill."*
3. **Explicit AI Change Review**:
   - Every modification is displayed as `Original:` vs `Suggested:`.
   - Action controls: `Accept`, `Reject`, `Edit`, `Accept All`, `Reject All`.
   - The master or draft resume is **never** overwritten automatically.

---

## 📊 ATS Scoring Methodology

The ATS engine computes a deterministic, multi-dimensional **ATS Compatibility Score (0 - 100)**:

| Category | Weight | Evaluation Criteria |
| :--- | :---: | :--- |
| **Keyword Match** | 20% | Frequency and density of role-specific required and preferred skills. |
| **Structure** | 10% | Machine-readable linear layout, recognized headings (Summary, Experience, Education, Skills). |
| **Readability** | 15% | High-impact action verbs (Engineered, Architected, Spearheaded), clean bullet points, absence of parsing blockers. |
| **Completeness** | 15% | Presence of contact info, professional summary, dates, institutions, degrees, and measurable results. |
| **Role Relevance**| 20% | Alignment between candidate achievements and target responsibilities. |
| **Formatting** | 10% | Safe margin dimensions, standard fonts, absence of unsupported tables, multi-column blocks, or graphics. |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Vanilla CSS design tokens (modular CSS modules, no Tailwind), Lucide React icons, Recharts, `html2pdf.js`.
- **Backend API**: Node.js, Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, Multer, `docx`, `pdf-parse`, `mammoth`.
- **AI Microservice**: Python 3.10+, FastAPI, Uvicorn, Pydantic, Regular Expressions, Semantic Synonym Dictionaries.
- **Database**: MongoDB (supports local MongoDB, MongoDB Atlas, and automatic zero-configuration in-memory fallback for immediate testing).

---

## ⚡ Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Python**: v3.10 or higher
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas URI (or automated in-memory mode)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Ezhilmaran06/ai_ats_resume_optimizer.git
cd ai_ats_resume_optimizer
```

---

### Step 2: Configure Environment Variables

Create `.env` inside `server/` (or copy `.env.example`):
```bash
cp .env.example server/.env
```

#### Environment Variables Reference
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration
# Leave blank or use local mongodb://localhost:27017/ai_ats_resume_optimizer
# In-memory MongoDB is automatically used if no external instance is running
MONGODB_URI=mongodb://localhost:27017/ai_ats_resume_optimizer

# Authentication
JWT_SECRET=ats_resume_optimizer_secret_key_2026_super_secure

# AI Microservice URL
AI_SERVICE_URL=http://localhost:8000

# Optional External AI API Key (Google Gemini or OpenAI)
AI_API_KEY=
AI_MODEL=gemini-1.5-flash
```

---

### Step 3: Install Dependencies

#### Install Node backend & client dependencies:
```bash
npm run install:all
```

#### Install Python AI microservice dependencies:
```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

---

### Step 4: Run the Services

Start each service in a separate terminal:

#### Terminal 1 — Python FastAPI AI Service:
```bash
cd ai-service
python -m uvicorn app.main:app --port 8000 --reload
```
*Health Check: `http://localhost:8000/health` or `http://localhost:8000/api/ai/health`*

#### Terminal 2 — Node.js Express Backend:
```bash
cd server
npm run dev
```
*Health Check: `http://localhost:5000/api/health`*

#### Terminal 3 — React Vite Client:
```bash
cd client
npm run dev
```
*App URL: `http://localhost:5173`*

---

## 📚 API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new candidate account.
- `POST /api/auth/login` — Login and receive JWT access token.
- `GET /api/auth/me` — Retrieve authenticated user profile.

### Resumes (`/api/resumes`)
- `GET /api/resumes` — List all user resumes (master and job-specific copies).
- `POST /api/resumes` — Create a new structured resume.
- `POST /api/resumes/upload` — Upload PDF/DOCX/TXT resume, extract text, parse sections, and generate baseline ATS score.
- `GET /api/resumes/:id` — Retrieve full resume data and ATS rubric score.
- `PUT /api/resumes/:id` — Update resume content and formatting.
- `POST /api/resumes/:id/recalculate` — Recalculate live ATS score with debounced draft payload.
- `POST /api/resumes/:id/duplicate` — Duplicate resume into a dedicated job-specific copy.
- `PUT /api/resumes/:id/rename` — Rename a resume version.
- `DELETE /api/resumes/:id` — Delete a resume version (Master Resume is protected).
- `GET /api/resumes/:id/compare` — Compute Before/After diff vs Master Resume.
- `GET /api/resumes/:id/export/docx` — Export ATS-compliant A4 Word document.
- `GET /api/resumes/:id/export/txt` — Export ATS plain text file.

### Target Jobs (`/api/jobs`)
- `GET /api/jobs` — List analyzed job descriptions.
- `POST /api/jobs` — Analyze pasted JD or uploaded file and extract classified requirements table.
- `DELETE /api/jobs/:id` — Remove an analyzed job posting.

### Matching & AI Optimizer (`/api/matching`)
- `POST /api/matching/compare` — Compare resume against job description; return matched, partial, and missing skills.
- `POST /api/matching/optimize` — Generate anti-fabrication improvement plan.
- `POST /api/matching/apply-suggestions` — Apply reviewed and accepted AI changes to resume draft.

### Python AI Engine (`http://localhost:8000`)
- `GET /health` — Service health check.
- `POST /api/ai/parse-resume` — Document text parsing and section segmentation.
- `POST /api/ai/calculate-ats-score` — Deterministic 6-category ATS score calculation.
- `POST /api/ai/analyze-job-role` — Extract technical stack, seniority, and responsibilities.
- `POST /api/ai/match-role` — Semantic requirement matching and anti-fabrication checks.
- `POST /api/ai/optimize-resume` — Factual bullet point refinement and skill alignment.

---

## 🧪 Verification & Automated Testing

### 1. Run Complete 17-Step End-to-End Workflow Test
Tests the complete core product workflow (registration, upload, ATS scoring, role analysis, semantic matching, AI review, live recalculation, version duplicate, and export):
```bash
node server/test/finalIntegrationTest.js
```

### 2. Run Backend E2E Test Suite
```bash
node server/test/e2eTest.js
```

### 3. Run Python AI Service Unit Tests
```bash
python ai-service/test_ai_service.py
```

### 4. Build Frontend for Production
```bash
npm --prefix client run build
```

---

## 🔒 Security & Privacy

- **Stateless Authentication**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Protected Endpoints**: JWT authentication with bearer header and secure query token support for binary downloads.
- **Master Resume Protection**: Source-of-truth master resume is protected from accidental deletion.
- **Anti-Fabrication Guard**: AI suggestion engine rejects prompts that fabricate unverified skills.
- **Clean Document Generation**: Exported PDF, DOCX, and TXT files contain clean layout markup without tracking scripts.

---

## 📄 License
This project is licensed under the MIT License.
