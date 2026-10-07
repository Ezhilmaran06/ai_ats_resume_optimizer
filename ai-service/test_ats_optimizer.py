import unittest
import io
import docx
from fastapi.testclient import TestClient
from app.main import app

class TestAtsOptimizer(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

        # PDF Resume bytes
        with open('../graduate_engineer.pdf', 'rb') as f:
            self.pdf_bytes = f.read()

        # TXT Resume
        self.txt_resume = """
        Alex Morgan
        Email: alex.morgan@example.com | Phone: +1-555-0199 | San Francisco, CA

        SUMMARY
        Full-stack software engineer with experience in React, Python, JavaScript, and PostgreSQL.

        SKILLS
        Languages: Python, JavaScript, TypeScript, SQL
        Frontend: React, Redux, HTML5, CSS3
        Backend: Node.js, Express, FastAPI, PostgreSQL, Redis
        DevOps & Tools: Docker, Git, CI/CD, AWS

        EXPERIENCE
        Software Engineering Intern | TechCorp (2023 - Present)
        - Developed full-stack web applications using React and FastAPI, reducing response time by 30%.
        - Designed PostgreSQL database schema and optimized REST APIs for 10,000+ monthly users.

        EDUCATION
        B.S. in Computer Science | State University (2020 - 2024)

        PROJECTS
        E-Commerce Platform
        - Architected web store utilizing React, Node.js, and PostgreSQL with Docker containerization.
        """

        # DOCX Resume
        doc = docx.Document()
        doc.add_heading('Sarah Connor', 0)
        doc.add_paragraph('Email: sarah.c@example.com | Phone: 555-987-6543 | New York, NY')
        doc.add_heading('Professional Summary', level=1)
        doc.add_paragraph('Experienced DevOps and Backend Engineer with 5+ years building containerized cloud infrastructures.')
        doc.add_heading('Technical Skills', level=1)
        doc.add_paragraph('Languages: Python, Go, Bash, SQL\nDevOps: Docker, Kubernetes, AWS, Terraform, CI/CD\nDatabases: PostgreSQL, Redis')
        doc.add_heading('Work Experience', level=1)
        doc.add_paragraph('Senior Cloud Engineer | CloudScale Inc. (2020 - Present)')
        p = doc.add_paragraph()
        p.add_run('- Architected multi-region Kubernetes clusters on AWS supporting 50+ microservices.\n')
        p.add_run('- Automated zero-downtime CI/CD deployment pipelines using GitHub Actions and Terraform.\n')
        doc.add_heading('Education', level=1)
        doc.add_paragraph('B.S. in Computer Engineering | Columbia University (2016 - 2020)')
        docx_io = io.BytesIO()
        doc.save(docx_io)
        self.docx_bytes = docx_io.getvalue()

        # Target Job Descriptions
        self.matching_jd = """
        Job Title: Full Stack Software Engineer
        Requirements:
        - Hands-on experience with Python, JavaScript, and React.
        - Experience with PostgreSQL and REST API design.
        - Familiarity with Docker and Git.
        Responsibilities:
        - Build web application features with React and backend services.
        - Collaborate with agile team to deliver scalable software.
        """

        self.mismatch_jd = """
        Job Title: Principal C++ Systems Architect
        Requirements:
        - 10+ years experience in low-latency C++ systems and Assembly.
        - Expertise in Embedded Linux kernel drivers and FPGA design.
        - Deep knowledge of RTOS and automotive CAN bus protocols.
        Responsibilities:
        - Design real-time safety critical firmware systems.
        """

    def test_01_upload_pdf_analysis(self):
        """Test 1: Upload PDF + JD -> analysis works."""
        res = self.client.post(
            "/api/analyze",
            files={"resume": ("graduate_engineer.pdf", self.pdf_bytes, "application/pdf")},
            data={"job_description": self.matching_jd}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("ats_score", data)
        self.assertGreaterEqual(data["ats_score"], 0)
        self.assertLessEqual(data["ats_score"], 100)
        self.assertIn("score_breakdown", data)
        self.assertIn("matched_keywords", data)
        self.assertIn("missing_keywords", data)

    def test_02_upload_docx_analysis(self):
        """Test 2: Upload DOCX + JD -> analysis works."""
        res = self.client.post(
            "/api/analyze",
            files={"resume": ("sarah_connor.docx", self.docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
            data={"job_description": self.matching_jd}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("ats_score", data)
        self.assertTrue(len(data["matched_keywords"]) > 0)

    def test_03_upload_txt_analysis(self):
        """Test 3: Upload TXT + JD -> analysis works."""
        res = self.client.post(
            "/api/analyze",
            files={"resume": ("alex_morgan.txt", self.txt_resume.encode("utf-8"), "text/plain")},
            data={"job_description": self.matching_jd}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("ats_score", data)
        self.assertGreaterEqual(data["ats_score"], 70)

    def test_04_missing_resume_error(self):
        """Test 4: Missing resume -> correct 400 error."""
        res = self.client.post(
            "/api/analyze",
            data={"job_description": self.matching_jd}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("No resume file provided", res.json()["detail"])

    def test_05_missing_jd_error(self):
        """Test 5: Missing or empty JD -> correct 400 error."""
        res = self.client.post(
            "/api/analyze",
            files={"resume": ("resume.txt", self.txt_resume.encode("utf-8"), "text/plain")},
            data={"job_description": ""}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Job description cannot be empty", res.json()["detail"])

    def test_06_invalid_file_error(self):
        """Test 6: Invalid file format (.png) -> correct 400 error."""
        res = self.client.post(
            "/api/analyze",
            files={"resume": ("image.png", b"fake-png-data", "image/png")},
            data={"job_description": self.matching_jd}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Unsupported file format", res.json()["detail"])

    def test_07_and_08_score_calibration(self):
        """Test 7 & 8: High-match JD gives higher score than low-match JD."""
        res_high = self.client.post(
            "/api/analyze",
            files={"resume": ("alex.txt", self.txt_resume.encode("utf-8"), "text/plain")},
            data={"job_description": self.matching_jd}
        )
        res_low = self.client.post(
            "/api/analyze",
            files={"resume": ("alex.txt", self.txt_resume.encode("utf-8"), "text/plain")},
            data={"job_description": self.mismatch_jd}
        )
        score_high = res_high.json()["ats_score"]
        score_low = res_low.json()["ats_score"]
        self.assertGreater(score_high, score_low)

    def test_09_missing_jd_keyword_detected(self):
        """Test 9: Important JD keyword missing -> appears in Missing Keywords with guidance."""
        special_jd = self.matching_jd + "\n- Must have experience with Kubernetes and Terraform container platforms."
        res = self.client.post(
            "/api/analyze",
            files={"resume": ("alex.txt", self.txt_resume.encode("utf-8"), "text/plain")},
            data={"job_description": special_jd}
        )
        data = res.json()
        missing_kw_names = [m["keyword"].lower() for m in data["missing_keywords"]]
        self.assertTrue("kubernetes" in missing_kw_names or "terraform" in missing_kw_names)
        # Anti-fabrication check
        sample_missing = next(m for m in data["missing_keywords"] if m["keyword"].lower() in ["kubernetes", "terraform"])
        self.assertIn("If you have genuine experience", sample_missing["reason"])

    def test_10_score_stability(self):
        """Test 10: Repeated analysis of same resume + same JD produces stable score."""
        scores = []
        for _ in range(3):
            r = self.client.post(
                "/api/analyze",
                files={"resume": ("alex.txt", self.txt_resume.encode("utf-8"), "text/plain")},
                data={"job_description": self.matching_jd}
            )
            scores.append(r.json()["ats_score"])
        self.assertEqual(len(set(scores)), 1, "Scores must be deterministic across identical runs.")

    def test_11_no_fake_data(self):
        """Test 11: Breakdown sums up exactly to ats_score and no hardcoded values."""
        res = self.client.post(
            "/api/analyze",
            files={"resume": ("alex.txt", self.txt_resume.encode("utf-8"), "text/plain")},
            data={"job_description": self.matching_jd}
        )
        data = res.json()
        bd = data["score_breakdown"]
        breakdown_sum = (
            bd["ats_readability"] +
            bd["structure"] +
            bd["keyword_coverage"] +
            bd["skills_match"] +
            bd["experience_relevance"] +
            bd["project_relevance"] +
            bd["job_alignment"] +
            bd["professional_language"]
        )
        self.assertEqual(breakdown_sum, data["ats_score"])

    def test_12_no_auth_required(self):
        """Test 12: Endpoint requires no JWT, no cookies, no user account."""
        res = self.client.post(
            "/api/analyze",
            files={"resume": ("alex.txt", self.txt_resume.encode("utf-8"), "text/plain")},
            data={"job_description": self.matching_jd}
        )
        self.assertNotEqual(res.status_code, 401)
        self.assertNotEqual(res.status_code, 403)
        self.assertEqual(res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
