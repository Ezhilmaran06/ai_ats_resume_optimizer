import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.ats_engine import calculate_ats_score
from app.services.role_analyzer import analyze_job_description
from app.services.semantic_matcher import perform_resume_role_matching
from app.services.resume_optimizer import optimize_resume_for_role

class TestAiService(unittest.TestCase):
    def setUp(self):
        self.sample_resume = {
            "fullName": "Jane Doe",
            "title": "Full Stack Software Engineer",
            "email": "jane.doe@example.com",
            "phone": "+1 (555) 019-2834",
            "summary": "Experienced Full Stack Engineer proficient in React, Node.js, and TypeScript with 4 years building scalable web services.",
            "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Express", "PostgreSQL", "Docker", "Git"],
            "experience": [
                {
                    "company": "Tech Innovations Inc.",
                    "role": "Software Engineer",
                    "startDate": "2022-01",
                    "endDate": "Present",
                    "highlights": [
                        "Architected scalable microservices using Node.js and TypeScript, reducing API latency by 35%.",
                        "Built dynamic frontend components in React and Redux supporting 50,000+ daily active users."
                    ]
                }
            ],
            "education": [
                {
                    "institution": "University of Technology",
                    "degree": "B.S. in Computer Science",
                    "startDate": "2018-09",
                    "endDate": "2022-05"
                }
            ]
        }

        self.sample_jd = """
        Job Title: Senior Software Engineer
        Company: CloudNova Solutions
        Requirements:
        - 3+ years experience with TypeScript, React, and Node.js.
        - Experience designing RESTful APIs and PostgreSQL databases.
        - Experience with Docker containerization.
        - Familiarity with AWS and Kubernetes is preferred.
        """

    def test_ats_engine_scoring(self):
        result = calculate_ats_score(self.sample_resume)
        self.assertIn("overallScore", result)
        score = result["overallScore"]
        self.assertGreaterEqual(score, 50)
        self.assertLessEqual(score, 100)
        self.assertIn("breakdown", result)

    def test_role_analysis(self):
        analysis = analyze_job_description("Senior Software Engineer", self.sample_jd, "CloudNova Solutions")
        self.assertTrue(len(analysis.get("requiredSkills", [])) > 0 or len(analysis.get("classifiedRequirements", [])) > 0)
        self.assertEqual(analysis.get("company"), "CloudNova Solutions")

    def test_semantic_matching(self):
        match_res = perform_resume_role_matching(self.sample_resume, {
            "requiredSkills": ["TypeScript", "React", "Node.js", "Docker", "AWS", "Kubernetes"]
        })
        self.assertIn("matchPercentage", match_res)
        self.assertGreaterEqual(match_res["matchPercentage"], 30)

    def test_anti_fabrication_optimizer(self):
        plan = optimize_resume_for_role(self.sample_resume, {
            "role": "Senior Software Engineer",
            "company": "CloudNova Solutions",
            "requiredSkills": ["TypeScript", "React", "AWS", "Kubernetes"]
        })
        self.assertIn("suggestions", plan)

if __name__ == "__main__":
    unittest.main()
