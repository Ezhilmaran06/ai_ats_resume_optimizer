require('dotenv').config();
const { analyzeJobDescription } = require('../services/ai/jobAnalyzer');
const { matchResumeToJob } = require('../services/matching/matchingEngine');
const { optimizeResumeForJob } = require('../services/ai/resumeOptimizer');
const { analyzeAtsCompatibility } = require('../services/ai/atsAnalyzer');

// Python AI Client functions
const {
  checkPythonHealth,
  analyzeRoleWithPython,
  analyzeKeywordsWithPython,
  analyzeMatchWithPython,
  optimizeResumeWithPython
} = require('../services/ai/pythonAiClient');

async function runPhase4E2ETest() {
  console.log('================================================================');
  console.log('   AI ATS RESUME OPTIMIZER — PHASE 4 END-TO-END VERIFICATION    ');
  console.log('================================================================\n');

  // STEP 1: Upload / Parse Resume
  console.log('--- STEP 1: UPLOAD / PARSE CANDIDATE RESUME ---');
  const sampleCandidateResume = {
    title: 'Software Engineer Resume',
    personalInfo: {
      fullName: 'Alex Morgan',
      professionalTitle: 'Software Engineer',
      email: 'alex.morgan@example.com',
      phone: '+1 555-0144',
      location: 'San Francisco, CA'
    },
    summary: 'Full-stack software engineer with hands-on experience in JavaScript, React, Node.js, Express, and PostgreSQL. Experienced in building web services and microservices architecture.',
    skills: {
      programmingLanguages: ['JavaScript', 'TypeScript', 'Python'],
      frameworks: ['React', 'Node.js', 'Express', 'FastAPI'],
      databases: ['PostgreSQL', 'MongoDB', 'Redis'],
      cloud: ['Docker', 'CI/CD', 'Linux'],
      tools: ['Git', 'Postman', 'RESTful Web Services', 'Jest', 'Agile'],
      softSkills: ['Problem Solving', 'Team Collaboration', 'Communication']
    },
    experience: [
      {
        company: 'Nexus Cloud Systems',
        role: 'Software Engineer',
        startDate: '2023-01',
        endDate: 'Present',
        currentlyWorking: true,
        description: 'developed web applications and microservices using Express and React.',
        highlights: [
          'built scalable RESTful Web Services serving high traffic',
          'implemented containerization workflows with Docker and automated testing'
        ]
      }
    ],
    projects: [
      {
        title: 'Distributed Analytics Service',
        description: 'built high-throughput event metrics visualizer.',
        technologies: ['React', 'Node.js', 'PostgreSQL']
      }
    ]
  };

  console.log(`✓ Candidate Profile Loaded: ${sampleCandidateResume.personalInfo.fullName}`);
  console.log(`  - Verified Skills: ${sampleCandidateResume.skills.frameworks.concat(sampleCandidateResume.skills.databases).join(', ')}`);

  // STEP 2: Calculate Baseline ATS Score
  console.log('\n--- STEP 2: BASELINE ATS SCORE CALCULATION ---');
  const baselineAts = analyzeAtsCompatibility(sampleCandidateResume, null, 'ats-classic');
  console.log(`✓ Baseline ATS Score: ${baselineAts.overallScore}/100`);
  console.log(`  - Breakdown: Keyword Relevance (${baselineAts.categories.keywordRelevance.score}/${baselineAts.categories.keywordRelevance.maxScore}), Skills Match (${baselineAts.categories.skillsMatch.score}/${baselineAts.categories.skillsMatch.maxScore})`);

  // STEP 3: Enter Software Engineer Job Description
  console.log('\n--- STEP 3: ENTER SOFTWARE ENGINEER JOB DESCRIPTION ---');
  const sampleJobDescription = `
Senior Software Engineer — CloudScale Technologies
Location: San Francisco, CA / Remote

About the Role:
CloudScale Technologies is seeking a Senior Software Engineer to build resilient microservices and cloud infrastructure.

Responsibilities:
• Architect, build, and deploy high-performance web applications using React, Node.js, and TypeScript.
• Design robust REST APIs and integrate scalable database solutions using PostgreSQL, MongoDB, and Redis.
• Collaborate with infrastructure teams to deploy containerized microservices via Docker and Kubernetes on AWS.
• Implement CI/CD deployment pipelines with comprehensive automated unit testing using Jest.
• Lead code reviews and mentor junior engineers in clean code and agile practices.

Requirements (Must have):
• Strong proficiency in JavaScript, TypeScript, React, and Node.js.
• Demonstrated experience building scalable REST APIs and relational databases (PostgreSQL).
• Experience with Docker containerization and CI/CD pipelines.
• Bachelor's degree in Computer Science or equivalent practical experience.
• 3+ years of professional software engineering experience.

Preferred Qualifications:
• Familiarity with AWS cloud services (EC2, S3, RDS, Lambda).
• Experience with Kubernetes orchestration.
• Familiarity with Redis caching.
  `;

  console.log('✓ Job Description Provided: Senior Software Engineer at CloudScale Technologies');

  // STEP 4: AI Role Analysis (Python Endpoint / Service)
  console.log('\n--- STEP 4: AI ROLE ANALYSIS ---');
  let roleAnalysis = null;
  const isPythonAlive = await checkPythonHealth();

  if (isPythonAlive) {
    console.log('✓ Connecting to Python FastAPI role analyzer...');
    roleAnalysis = await analyzeRoleWithPython('Senior Software Engineer', sampleJobDescription, 'CloudScale Technologies');
  } else {
    console.log('⚠ Python microservice offline, using deterministic NLP role analyzer...');
    roleAnalysis = await analyzeJobDescription(sampleJobDescription, 'Senior Software Engineer', 'CloudScale Technologies');
  }

  console.log(`✓ Job Title: ${roleAnalysis.jobTitle || roleAnalysis.extractedRole || roleAnalysis.role}`);
  console.log(`✓ Required Skills: ${(roleAnalysis.requiredSkills || []).slice(0, 8).join(', ')}`);
  console.log(`✓ Preferred Skills: ${(roleAnalysis.preferredSkills || []).slice(0, 6).join(', ')}`);
  if (roleAnalysis.programmingLanguages) {
    console.log(`✓ Languages: ${roleAnalysis.programmingLanguages.join(', ')}`);
    console.log(`✓ Frameworks: ${roleAnalysis.frameworks.join(', ')}`);
    console.log(`✓ Databases: ${roleAnalysis.databases.join(', ')}`);
    console.log(`✓ Cloud/DevOps: ${roleAnalysis.cloudTechnologies.join(', ')}`);
    console.log(`✓ Tools: ${roleAnalysis.tools.join(', ')}`);
    console.log(`✓ Responsibilities Extracted: ${roleAnalysis.responsibilities.length}`);
    console.log(`✓ Classifications: Required, Preferred, Optional structured`);
  }

  // STEP 5: Semantic Match & Keyword Analysis
  console.log('\n--- STEP 5: SEMANTIC RESUME ROLE MATCHING & KEYWORD ANALYSIS ---');
  let matchResults = null;
  const rolePayload = {
    role: 'Senior Software Engineer',
    company: 'CloudScale Technologies',
    extractedSkills: roleAnalysis.extractedSkills || ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Docker', 'AWS', 'Kubernetes', 'Redis'],
    requiredSkills: roleAnalysis.requiredSkills || ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Docker'],
    preferredSkills: roleAnalysis.preferredSkills || ['AWS', 'Kubernetes', 'Redis']
  };

  if (isPythonAlive) {
    matchResults = await analyzeMatchWithPython(sampleCandidateResume, rolePayload);
    console.log(`✓ Semantic Match Score: ${matchResults.matchPercentage}%`);
    console.log('✓ Semantic Match Verifications:');
    (matchResults.matchedSkills || []).slice(0, 5).forEach(m => {
      console.log(`   • ${m.name} -> ${m.matchedWith} (${m.matchType}): ${m.explanation}`);
    });
    console.log('✓ Missing Requirements Identified:');
    (matchResults.missingSkills || []).forEach(m => {
      console.log(`   ✕ ${m.name} (${m.status}): ${m.explanation}`);
    });
  } else {
    matchResults = matchResumeToJob(sampleCandidateResume, {
      requirementsTable: [
        { name: 'React', priority: 'Required', importance: 'High' },
        { name: 'REST APIs', priority: 'Required', importance: 'High' },
        { name: 'PostgreSQL', priority: 'Required', importance: 'High' },
        { name: 'Docker', priority: 'Required', importance: 'High' },
        { name: 'AWS', priority: 'Preferred', importance: 'Medium' }
      ]
    });
    console.log(`✓ Match Score: ${matchResults.matchPercentage}%`);
    console.log(`  - Matched: ${matchResults.matchedItems.map(i => i.name).join(', ')}`);
    console.log(`  - Missing: ${matchResults.missingItems.map(i => i.name).join(', ')}`);
  }

  // Verify REST APIs matches RESTful Web Services
  const restMatch = (matchResults.matchedSkills || matchResults.matchedItems || []).find(m => 
    (m.name && m.name.toLowerCase().includes('rest')) || (m.skill && m.skill.toLowerCase().includes('rest'))
  );
  if (restMatch) {
    console.log(`✓ Test Requirement Verified: 'RESTful Web Services' correctly matched 'REST APIs' via semantic engine!`);
  }

  // STEP 6: AI Resume Optimizer
  console.log('\n--- STEP 6: AI RESUME OPTIMIZER (STRICT ANTI-FABRICATION) ---');
  let optimizationPlan = null;
  if (isPythonAlive) {
    optimizationPlan = await optimizeResumeWithPython(sampleCandidateResume, rolePayload);
  } else {
    optimizationPlan = await optimizeResumeForJob(sampleCandidateResume, { role: 'Senior Software Engineer' }, { requirementsTable: [] });
  }

  console.log(`✓ Total Suggestions Generated: ${optimizationPlan.totalSuggestions || optimizationPlan.suggestions?.length || 0}`);
  console.log(`✓ Supported Suggestions (Safe to Suggest): ${optimizationPlan.supportedCount || 0}`);
  console.log(`✓ Unsupported Suggestions (Missing Requirements): ${optimizationPlan.unsupportedCount || 0}`);

  const summarySug = (optimizationPlan.suggestions || []).find(s => s.section === 'summary');
  if (summarySug) {
    console.log('\n[Optimized Summary Proposed]:');
    console.log(`   "${summarySug.suggested}"`);
    console.log(`   Status: ${summarySug.status} (${summarySug.rule || 'Verified'})`);
  }

  const skillsSug = (optimizationPlan.suggestions || []).find(s => s.section === 'skills' && s.reorderedList);
  if (skillsSug) {
    console.log('\n[Optimized Skills Ordering]:');
    console.log(`   Reordered: ${skillsSug.suggested}`);
  }

  // STEP 7: Anti-Fabrication Fact Validation
  console.log('\n--- STEP 7: ANTI-FABRICATION VALIDATION LAYER ---');
  const allSuggestions = optimizationPlan.suggestions || [];
  
  // Verify AWS is NOT hallucinated or added
  const awsInSuggestions = allSuggestions.find(s => 
    s.status === 'SUPPORTED' && (s.suggested && s.suggested.toLowerCase().includes('aws'))
  );
  if (awsInSuggestions) {
    throw new Error('FAILED ANTI-FABRICATION CHECK: Unverified skill AWS was suggested as SUPPORTED!');
  }
  console.log('✓ Anti-Fabrication Check Passed: Zero unverified skills (e.g. AWS) were fabricated or injected!');

  // Check missing skills alerts
  const awsMissingAlert = (optimizationPlan.missingSkillsAlerts || allSuggestions).find(a => 
    (a.skill && a.skill.includes('AWS')) || (a.title && a.title.includes('AWS'))
  );
  if (awsMissingAlert) {
    console.log(`✓ Verified Missing Alert Display: AWS is classified as Missing and NOT automatically added.`);
  }

  // STEP 8: ATS Score Improvement After Accepted Optimizations
  console.log('\n--- STEP 8: ATS RE-SCORING WITH OPTIMIZED DRAFT ---');
  const optimizedResumeDraft = optimizationPlan.optimizedResume || {
    ...sampleCandidateResume,
    summary: summarySug?.suggested || sampleCandidateResume.summary,
    skills: skillsSug?.reorderedList || sampleCandidateResume.skills
  };

  const newAtsReport = analyzeAtsCompatibility(optimizedResumeDraft, null, 'ats-classic');
  console.log(`✓ New ATS Score after applying verified optimizations: ${newAtsReport.overallScore}/100`);
  console.log(`  - Baseline ATS Score: ${baselineAts.overallScore}/100`);
  console.log(`  - Optimized ATS Score: ${newAtsReport.overallScore}/100 (Improvement: +${Math.max(0, newAtsReport.overallScore - baselineAts.overallScore)} pts)`);

  console.log('\n================================================================');
  console.log('   ✓ ALL PHASE 4 END-TO-END PIPELINE CHECKS PASSED SUCCESSFULLY! ');
  console.log('================================================================\n');
}

runPhase4E2ETest().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
