# AI ATS Resume Optimizer

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Know how well your resume matches the job before you apply.**

A focused, single-purpose AI ATS Resume and Job Description Analyzer. Upload your resume, paste any target job description, and instantly receive an AI ATS Compatibility Score, multi-category score breakdown, keyword matching with strict anti-fabrication guidance, semantic equivalency detection, and prioritized recommendations.

---

## 🎯 Product Purpose

The application has **only one core purpose**:
1. Upload your resume (PDF, DOCX, or TXT).
2. Enter or paste a Job Description.
3. Analyze the resume using AI and deterministic NLP parsers.
4. Calculate an AI ATS Compatibility Score (0–100).
5. Identify matched and important missing keywords from the Job Description.
6. Perform semantic matching across competencies.
7. Explain why the resume is losing ATS points.
8. Provide actionable, truth-preserving improvement suggestions.

No account registration, no login, no multi-page dashboards, no database storage.

---

## ✨ Features

- **Single Landing Page Workflow**: Clean, modern interface designed with SaaS aesthetics; everything takes place on one page.
- **Multi-Format Resume Ingestion**: Supports text-searchable PDF, DOCX, and TXT files (up to 10MB) with drag-and-drop.
- **Weighted 8-Dimension ATS Scoring**: Evaluates structural, content, keyword, and language signals rather than simplistic word counts.
- **Semantic Keyword Matching**: Recognizes equivalencies (e.g., `RESTful APIs ≈ REST APIs`, `Spring Boot ≈ Spring`, `TypeScript ≈ TS`).
- **Anti-Fabrication Policy**: Missing keywords explicitly guide candidates to add competencies *only if truthfully possessed* with supporting evidence.
- **Dynamic Problem Diagnosis**: Identifies why points were lost on your specific resume and job description (lacking metrics, missing keywords, layout hazards).
- **Suggested Rewrites**: Demonstrates concrete impact-focused rewrites using only verified technologies already present in the candidate's resume.
- **Score Stability**: Deterministic scoring algorithms ensure that re-analyzing the same resume against the same job description produces consistent results.

---

## 🏗️ Architecture

```text
React (Vite) Single Landing Page
               ↓
    POST /api/analyze (multipart/form-data)
               ↓
FastAPI Backend (ai-service)
  ├── Resume Document Parser (pypdf, python-docx, text extraction)
  ├── Job Description Analyzer (NLP extraction of skills, requirements, responsibilities)
  ├── Semantic Matcher (Exact, cluster, and component matching)
  ├── Multi-Dimensional ATS Scoring Engine (Calibrated 8-dimension rubric)
  └── Anti-Fabrication Recommendation Engine
               ↓
Strict Pydantic JSON Response
               ↓
Interactive Result Display (Score Meter, Keyword Analysis, Problems, Improvements)
```

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite 5, Vanilla CSS Design System, Lucide React icons, Axios
- **Backend / AI Engine**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Document Processing**: `pypdf`, `python-docx`
- **NLP & Analysis**: Custom semantic clusters, regex tokenizers, linguistic metric detectors, and optional external LLM integration (Gemini / OpenAI)

---

## 🚀 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)

---

### 1. Backend Setup (FastAPI)

Navigate to the `ai-service` directory and install Python dependencies:

```bash
cd ai-service
pip install -r requirements.txt
```

*(Optional)* Configure external LLM credentials in `.env` if desired:

```env
HOST=127.0.0.1
PORT=8000
AI_API_KEY=your_gemini_or_openai_api_key_here
AI_MODEL=gemini-1.5-flash
```

*Note: If `AI_API_KEY` is not provided, the engine runs completely offline using its calibrated local NLP semantic analyzer.*

Start the FastAPI backend service:

```bash
# From ai-service directory
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Or from the project root
npm run ai
```

The API will be available at `http://127.0.0.1:8000`. API documentation is available at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup (React + Vite)

In a new terminal, navigate to the `client` directory and install npm packages:

```bash
cd client
npm install
```

Start the Vite development server:

```bash
# From client directory
npm run dev

# Or from the project root
npm run client
```

Open `http://localhost:5173` in your browser.

---

### 3. Production Build

To build the optimized static assets:

```bash
npm run client:build
```

---

## 📄 Supported Resume Formats

- **PDF** (`.pdf`) — Plain text-searchable PDFs (scanned or image-only PDFs will return an actionable prompt).
- **DOCX** (`.docx`, `.doc`) — Microsoft Word documents.
- **TXT** (`.txt`) — Standard plain text documents.

Maximum file size: **10 MB**.

---

## 🔌 API Endpoint

### `POST /api/analyze`

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `resume` | `File` | Uploaded resume file (PDF, DOCX, TXT) |
| `job_description` | `string` | Target job description text (minimum 30 characters) |

**Response Format:** Validated with Pydantic (`AnalyzeResponse`)

```json
{
  "ats_score": 84,
  "score_breakdown": {
    "ats_readability": 13,
    "structure": 15,
    "keyword_coverage": 18,
    "skills_match": 13,
    "experience_relevance": 8,
    "project_relevance": 7,
    "job_alignment": 8,
    "professional_language": 5
  },
  "matched_keywords": ["Python", "JavaScript", "React", "PostgreSQL", "Docker", "Git"],
  "missing_keywords": [
    {
      "keyword": "Kubernetes",
      "importance": "HIGH",
      "reason": "Listed as a required competency in the job description but not detected in the resume. If you have genuine experience with Kubernetes, consider adding it to your Skills or Projects section with supporting evidence.",
      "risky": true
    }
  ],
  "recommended_keywords": [
    {
      "keyword": "Kubernetes",
      "importance": "HIGH",
      "reason": "Core requirement for Cloud Infrastructure role."
    }
  ],
  "semantic_matches": [
    {
      "requirement": "REST APIs",
      "resume_match": "RESTful APIs",
      "match_type": "Strong Match",
      "explanation": "Semantic match: 'RESTful APIs' in resume matches target requirement 'REST APIs'."
    }
  ],
  "problems": [
    {
      "title": "Core Required Keywords Missing (Kubernetes)",
      "description": "The job description explicitly prioritizes Kubernetes, but it was not found in your resume.",
      "severity": "HIGH"
    }
  ],
  "recommendations": [
    {
      "priority": "Priority 1",
      "title": "Incorporate Verified Missing Keywords Where Truthful",
      "reason": "ATS algorithms use keyword density and placement to rank candidates.",
      "suggestion": "Review missing keywords. If you possess genuine experience, document them in your Skills and Projects sections. Do NOT add technologies you have not worked with.",
      "suggested_rewrite": {
        "section": "Projects / Experience",
        "current": "Developed a web store using React and Python.",
        "suggested": "Architected and deployed web store using React, Python, PostgreSQL, ensuring high reliability, measurable performance impact, and ATS keyword coverage.",
        "label": "Suggested Rewrite",
        "reason": "Replaces basic task description with an active power verb and emphasizes verified technical stack."
      }
    }
  ],
  "resume_summary": "Alex Morgan | Profile includes 1 experience record(s) and 1 project(s). Core competencies: React, Python, PostgreSQL.",
  "job_summary": "Target Role: Full Stack Software Engineer | Key requirements: Python, React, PostgreSQL, Kubernetes.",
  "confidence": 92
}
```

---

## 📊 ATS Scoring Methodology

The **AI ATS Compatibility Score** (0–100) is calibrated across 8 weighted dimensions:

| Dimension | Max Points | What It Measures |
|---|---|---|
| **ATS Readability** | 15 | Plain text extractability, clean character encoding, standard contact header |
| **Resume Structure** | 15 | Linear section hierarchy, standard headings (Summary, Experience, Education, Skills, Projects) |
| **Keyword Coverage** | 20 | Weighted ratio of required and preferred technologies matched in resume |
| **Skills Match** | 15 | Semantic competency alignment across technical domains |
| **Experience Relevance** | 10 | Work history depth, role title alignment, and accomplishments |
| **Project Relevance** | 10 | Technical project depth, verified stack tags, and complexity |
| **Job Alignment** | 10 | Responsibilities overlap, education/degree fit, and role level |
| **Professional Language** | 5 | Power action verbs, absence of passive responsibility phrasing and personal pronouns |
| **Total** | **100** | **AI ATS Compatibility Score** |

### Calibration Bands

- **95 – 100**: Exceptional ATS Optimization
- **85 – 94**: Strong Competitive Alignment
- **70 – 84**: Strong ATS Compatibility
- **55 – 69**: Moderate ATS Compatibility
- **40 – 54**: Below Industry Standards
- **20 – 39**: Critical Rework Required

---

## 🛡️ Anti-Fabrication & Integrity Guarantee

The system strictly adheres to an **Anti-Fabrication Policy**:
- **Never hallucinates experience**: The AI never instructs a candidate to add a skill they do not possess.
- **Verified rewrites only**: Any suggested bullet rewrites reference exclusively technologies already verified in the candidate's existing resume.
- **Risky keyword alerts**: Highlights missing technologies with a warning to verify before adding.

---

## 🧪 Testing

Run the full automated test suite:

```bash
# Run ATS optimizer tests
python -m unittest discover -s ai-service -p "test_*.py"
```

The test suite validates:
1. PDF, DOCX, and TXT parsing.
2. Error handling (missing resume, missing JD, invalid formats, empty documents).
3. Score calibration (high-matching JD vs low-matching JD).
4. Missing keyword detection and anti-fabrication phrasing.
5. Deterministic score stability across repeated runs.
6. Mathematical consistency of the 8-dimension breakdown.
7. Fully unauthenticated access.

---

## 📝 License

Distributed under the MIT License.
