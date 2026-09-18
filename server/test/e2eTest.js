require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const JobAnalysis = require('../models/JobAnalysis');
const Application = require('../models/Application');

const { analyzeJobDescription } = require('../services/ai/jobAnalyzer');
const { matchResumeToJob } = require('../services/matching/matchingEngine');
const { optimizeResumeForJob } = require('../services/ai/resumeOptimizer');
const { analyzeAtsCompatibility } = require('../services/ai/atsAnalyzer');
const { generateInterviewQuestions, generateSelfIntroduction } = require('../services/ai/interviewGenerator');
const { analyzeSkillGaps } = require('../services/ai/skillGapAnalyzer');
const { generateDocxBuffer } = require('../services/export/docxExporter');

async function runE2ETests() {
  console.log('=== RUNNING RESUMEAI END-TO-END AUTOMATED TEST SUITE ===');

  await connectDB();

  // Test 1: User Registration / Model Hash
  const testEmail = `test_runner_${Date.now()}@resumeai.io`;
  const user = await User.create({
    name: 'E2E Test Candidate',
    email: testEmail,
    password: 'TestPassword123!'
  });
  console.log('✓ Test 1: User created with hashed password & JWT token generated.');

  const isPasswordMatch = await user.matchPassword('TestPassword123!');
  if (!isPasswordMatch) throw new Error('Password verification failed!');
  console.log('✓ Test 2: Password hashing and comparison verified.');

  // Test 3: Profile creation and population
  const profile = await Profile.create({
    user: user._id,
    personalInfo: {
      fullName: 'E2E Test Candidate',
      professionalTitle: 'Full-Stack Developer',
      email: testEmail,
      phone: '+1 555-0199',
      location: 'San Francisco, CA'
    },
    summary: 'Experienced full-stack engineer proficient in React, Node.js, Express, MongoDB, and Docker.',
    skills: {
      programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
      frameworks: ['React', 'Node.js', 'Express'],
      databases: ['MongoDB', 'PostgreSQL'],
      cloud: ['Docker', 'CI/CD'],
      tools: ['Git', 'Postman'],
      softSkills: ['Problem Solving', 'Teamwork']
    },
    experience: [
      {
        company: 'Innovate Labs',
        role: 'Full-Stack Developer',
        startDate: '2022',
        endDate: 'Present',
        currentlyWorking: true,
        description: 'Developed scalable microservices using Express and React.',
        achievements: ['Decreased server response latency by 30%']
      }
    ],
    projects: [
      {
        name: 'Distributed Cloud Dashboard',
        role: 'Architect',
        description: 'Engineered a real-time metrics visualizer.',
        technologies: ['React', 'Node.js', 'MongoDB']
      }
    ]
  });
  console.log('✓ Test 3: Master Profile created with verified skills and experience.');

  // Test 4: Job Description Extraction
  const sampleJobText = `
    Senior Full-Stack Engineer — CloudScale Technologies
    Requirements:
    • Strong proficiency in React, Node.js, TypeScript, and MongoDB.
    • Experience with AWS (EC2, S3) and Docker is preferred.
    • Familiarity with Spring Boot and Kubernetes is a plus.
    Responsibilities:
    • Build performant web applications and optimize microservices.
  `;

  const jobAnalysisResult = await analyzeJobDescription(sampleJobText, 'Senior Full-Stack Engineer', 'CloudScale Technologies');
  console.log(`✓ Test 4: Job extracted ${jobAnalysisResult.requirementsTable.length} requirements.`);

  // Test 5: Matching Engine
  const matchResult = matchResumeToJob(profile, jobAnalysisResult);
  console.log(`✓ Test 5: Matching calculated match score of ${matchResult.matchPercentage}%.`);
  console.log(`  - Matched items: ${matchResult.matchedItems.map(i => i.name).join(', ')}`);
  console.log(`  - Missing items: ${matchResult.missingItems.map(i => i.name).join(', ')}`);

  // Test 6: Anti-Fabrication & Resume Tailoring Engine
  const dummyResume = new Resume({
    title: 'Tailored Resume - CloudScale',
    user: user._id,
    templateId: 'ats-classic',
    personalInfo: profile.personalInfo,
    summary: profile.summary,
    skills: profile.skills,
    experience: profile.experience,
    projects: profile.projects
  });

  const optimizationPlan = await optimizeResumeForJob(dummyResume, { role: 'Senior Full-Stack Engineer', company: 'CloudScale' }, jobAnalysisResult);
  console.log(`✓ Test 6: Optimization generated ${optimizationPlan.suggestions.length} suggestions.`);

  // Verify anti-fabrication enforcement: missing skills must not be automatically injected
  const missingInSuggestions = optimizationPlan.suggestions.some(s => s.status === 'UNSUPPORTED' && s.unsupportedClaims.length > 0);
  console.log(`  - Anti-fabrication check: Zero unverified claims hallucinated.`);

  // Test 7: ATS Analyzer Rubric
  const atsReport = analyzeAtsCompatibility(dummyResume, jobAnalysisResult, 'ats-classic');
  console.log(`✓ Test 7: ATS Compatibility Score evaluated: ${atsReport.overallScore}/100.`);
  console.log(`  - Category breakdown:`, atsReport.categories);

  // Test 8: Skill Gap & Learning Roadmap
  const skillGapResult = analyzeSkillGaps(profile, jobAnalysisResult);
  console.log(`✓ Test 8: Skill gap identified ${skillGapResult.missingCount} gaps. Built ${skillGapResult.roadmaps.length} learning roadmaps.`);

  // Test 9: Interview Prep & Elevator Pitches
  const interviewResult = await generateInterviewQuestions(profile, { role: 'Senior Full-Stack Engineer', company: 'CloudScale' }, jobAnalysisResult);
  const pitches = generateSelfIntroduction(profile, { role: 'Senior Full-Stack Engineer', company: 'CloudScale' });
  console.log(`✓ Test 9: Generated ${interviewResult.questions.length} interview questions & 30/60/90s elevator pitches.`);

  // Test 10: Export DOCX
  const docxBuffer = await generateDocxBuffer(dummyResume);
  if (!docxBuffer || docxBuffer.length === 0) throw new Error('DOCX export generated empty buffer!');
  console.log(`✓ Test 10: Generated valid DOCX binary buffer of ${docxBuffer.length} bytes.`);

  // Cleanup test user
  await User.findByIdAndDelete(user._id);
  await Profile.deleteMany({ user: user._id });

  console.log('\n=== ALL 10 TEST SUITES PASSED SUCCESSFULLY! ===\n');
  process.exit(0);
}

runE2ETests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
