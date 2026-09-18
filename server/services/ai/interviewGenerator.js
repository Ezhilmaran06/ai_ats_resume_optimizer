const aiClient = require('./aiClient');
const { getAllUserSkills } = require('../matching/matchingEngine');

/**
 * Generates interview questions across categories based on Job Description and User Profile
 */
async function generateInterviewQuestions(profile, job, jobAnalysis) {
  const verifiedSkills = getAllUserSkills(profile);
  const projects = profile.projects || [];
  const role = job.role || jobAnalysis.extractedRole || 'Software Engineer';
  const company = job.company || jobAnalysis.extractedCompany || 'Target Company';

  const questions = [];

  // 1. Technical Questions (derived from job requirements)
  const reqSkills = (jobAnalysis.requirementsTable || []).map(r => r.name).slice(0, 4);
  reqSkills.forEach((skill, idx) => {
    questions.push({
      id: `tech-${idx}`,
      category: 'Technical',
      question: `How have you used ${skill} in production? What architectural trade-offs or performance considerations did you encounter?`,
      sampleAnswer: verifiedSkills.includes(skill)
        ? `In my experience developing full-stack systems, I leveraged ${skill} to handle scalable operations. For example, structuring modular components and caching key queries to optimize response times.`
        : `While ${skill} is a target technology in this role, I have extensive foundational expertise in adjacent technologies like ${verifiedSkills[0] || 'modern web stacks'} and can ramp up quickly.`,
      tips: `Focus on real implementation details, testing strategy, and how you ensured stability with ${skill}.`
    });
  });

  // 2. Project Questions (grounded ONLY in user's real projects)
  projects.forEach((proj, idx) => {
    questions.push({
      id: `proj-${idx}`,
      category: 'Project',
      question: `Walk me through your "${proj.name}" project. What was your specific architectural contribution and the biggest technical hurdle?`,
      sampleAnswer: `In "${proj.name}", I served as ${proj.role || 'lead developer'}. ${proj.description || ''} The primary challenge was ensuring seamless data synchronization and resilient API error handling across the stack.`,
      tips: 'Use the STAR method (Situation, Task, Action, Result) to structure your project walkthrough.'
    });
  });

  // 3. Behavioral Questions
  questions.push({
    id: 'beh-1',
    category: 'Behavioral',
    question: `Tell me about a time when a critical bug occurred in production. How did you diagnose, communicate, and remediate the issue?`,
    sampleAnswer: `When diagnosing unexpected system regressions, I first isolate reproduction steps using server logs and monitoring telemetry, notify relevant stakeholders with clear ETA updates, write a patch with regression tests, and conduct a post-mortem to prevent recurrence.`,
    tips: 'Demonstrate emotional maturity, clear communication under pressure, and systematic root-cause analysis.'
  });

  // 4. Scenario-based Question
  questions.push({
    id: 'scen-1',
    category: 'Scenario-based',
    question: `How would you design a high-throughput endpoint for ${role} responsibilities that handles traffic spikes without degrading database latency?`,
    sampleAnswer: `I would incorporate an in-memory caching layer (such as Redis), implement connection pooling, utilize asynchronous job queues for non-blocking operations, and apply rate limiting at the API gateway level.`,
    tips: 'Think aloud: start with high-level architecture, then dive into data storage, caching, and failover mechanisms.'
  });

  // 5. HR / Culture Question
  questions.push({
    id: 'hr-1',
    category: 'HR',
    question: `Why are you interested in joining ${company} as a ${role}, and what environment allows you to do your best work?`,
    sampleAnswer: `I am excited about ${company}'s focus on engineering excellence. I thrive in an autonomous, collaborative environment where clean architecture, continuous learning, and end-user impact are prioritized.`,
    tips: 'Connect your personal values with the company culture and growth trajectory.'
  });

  return {
    role,
    company,
    questions
  };
}

/**
 * Generates 30s, 60s, and 90s self-introductions grounded in real profile
 */
function generateSelfIntroduction(profile, job) {
  const name = profile.personalInfo?.fullName || 'Candidate';
  const role = profile.personalInfo?.professionalTitle || 'Software Developer';
  const skills = getAllUserSkills(profile).slice(0, 4).join(', ');
  const targetRole = job?.role || 'this position';
  const targetCompany = job?.company || 'your team';

  const expCount = profile.experience?.length || 1;
  const topProject = profile.projects?.[0]?.name || 'web engineering initiatives';

  const pitch30 = `Hi, I'm ${name}, a ${role} with core expertise in ${skills}. I specialize in building reliable, scalable web applications and delivering measurable software impact. I'm excited about the ${targetRole} opportunity at ${targetCompany} to help scale your core engineering initiatives.`;

  const pitch60 = `Hi, I'm ${name}, a ${role} specializing in ${skills}. Throughout my career across ${expCount} professional engagements, I have focused on designing robust backend services and responsive user interfaces. One highlight includes developing ${topProject}, where I solved complex data flow challenges and optimized application throughput. I admire ${targetCompany}'s technical direction and look forward to contributing my problem-solving skills to your team.`;

  const pitch90 = `Hello, my name is ${name}. I am a ${role} with a solid background in software engineering, primarily focused on ${skills}. My approach centers on engineering maintainable code, adhering to clean architecture, and collaborating closely with product teams. In my recent work, I spearheaded key initiatives such as ${topProject}, which strengthened my expertise in distributed systems and performance optimization. What excites me most about ${targetCompany} is the opportunity to apply these skills to solve high-impact challenges for your customers as a ${targetRole}.`;

  return {
    pitch30,
    pitch60,
    pitch90
  };
}

module.exports = { generateInterviewQuestions, generateSelfIntroduction };
