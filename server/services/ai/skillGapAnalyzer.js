const { matchResumeToJob, getAllUserSkills } = require('../matching/matchingEngine');

/**
 * Roadmap database for common software engineering skills
 */
const SKILL_ROADMAP_DETAILS = {
  'docker': {
    whyItMatters: 'Standardizes runtime environments across development and production, eliminating "works on my machine" issues.',
    prerequisites: ['Basic Linux command line', 'Networking concepts', 'Process isolation'],
    topics: ['Containers vs VMs', 'Dockerfile instructions', 'Multi-stage builds', 'Docker volumes & networks', 'Docker Compose'],
    suggestedProject: 'Containerize a multi-service web app (frontend, backend, database) with docker-compose and healthchecks.',
    estimatedLevel: 'Intermediate',
    estimatedTime: '1 - 2 weeks'
  },
  'aws': {
    whyItMatters: 'Leading cloud platform used by high-scale companies to host infrastructure, compute, storage, and serverless applications.',
    prerequisites: ['Basic networking (DNS, IP, ports)', 'Linux fundamentals', 'Security essentials'],
    topics: ['EC2, VPC, & Security Groups', 'S3 Object Storage', 'RDS & DynamoDB', 'IAM Policies & Roles', 'Lambda serverless functions'],
    suggestedProject: 'Deploy a full-stack web application with EC2/ECS, S3 for static assets, and an RDS PostgreSQL instance behind an ALB.',
    estimatedLevel: 'Intermediate to Advanced',
    estimatedTime: '3 - 4 weeks'
  },
  'spring boot': {
    whyItMatters: 'Enterprise-grade Java framework providing rapid microservice creation with built-in dependency injection, security, and data layers.',
    prerequisites: ['Core Java (OOP, Collections, Streams)', 'Maven / Gradle', 'HTTP / REST concepts'],
    topics: ['Spring IoC & Dependency Injection', 'Spring Data JPA & Hibernate', 'Spring Security with JWT', 'Actuator & Metrics', 'JUnit & Mockito'],
    suggestedProject: 'Build a production-ready REST API for an e-commerce order management system with PostgreSQL and JWT authentication.',
    estimatedLevel: 'Intermediate',
    estimatedTime: '2 - 3 weeks'
  },
  'kubernetes': {
    whyItMatters: 'Industry standard container orchestration platform managing automated deployments, scaling, and self-healing in production clusters.',
    prerequisites: ['Docker proficiency', 'Microservice architecture', 'YAML basics'],
    topics: ['Pods, Deployments, & ReplicaSets', 'Services & Ingress controllers', 'ConfigMaps & Secrets', 'PersistentVolumes', 'Helm charts'],
    suggestedProject: 'Deploy a replicated microservices app onto a local Minikube cluster with auto-scaling and declarative Helm charts.',
    estimatedLevel: 'Advanced',
    estimatedTime: '3 - 4 weeks'
  },
  'ci/cd': {
    whyItMatters: 'Automates testing, linting, and zero-downtime deployment pipelines, dramatically accelerating software release cycles.',
    prerequisites: ['Git & GitHub workflow', 'Bash scripting', 'Automated testing'],
    topics: ['GitHub Actions syntax & workflows', 'Matrix testing builds', 'Secret management', 'Automated container push to Docker Hub', 'Staging deployment'],
    suggestedProject: 'Create a GitHub Actions pipeline that lints code, executes unit tests, builds a Docker image, and deploys to cloud hosting upon merge to main.',
    estimatedLevel: 'Beginner to Intermediate',
    estimatedTime: '1 week'
  },
  'graphql': {
    whyItMatters: 'Enables flexible data fetching allowing clients to request exactly what they need without over-fetching or multiple network roundtrips.',
    prerequisites: ['REST APIs', 'Node.js or Python', 'Schema design'],
    topics: ['Schema Definition Language (SDL)', 'Queries, Mutations, & Subscriptions', 'Resolvers & DataLoader', 'Apollo Server / Client'],
    suggestedProject: 'Convert a RESTful blogging API into a GraphQL API with DataLoader batching to solve N+1 queries.',
    estimatedLevel: 'Intermediate',
    estimatedTime: '1 - 2 weeks'
  },
  'redis': {
    whyItMatters: 'Ultra-fast in-memory key-value data store used for high-performance caching, session state, message brokers, and rate limiting.',
    prerequisites: ['Basic caching theory', 'Database indexing', 'Key-value data structures'],
    topics: ['Redis data structures (strings, hashes, lists, sets, sorted sets)', 'Cache-aside & Write-through patterns', 'Pub/Sub queues', 'TTL expiration'],
    suggestedProject: 'Implement a distributed rate-limiter and API response cache middleware in Express.js using Redis.',
    estimatedLevel: 'Intermediate',
    estimatedTime: '1 week'
  }
};

/**
 * Analyzes skill gaps and constructs step-by-step learning roadmaps
 */
function analyzeSkillGaps(profileOrResume, jobAnalysis) {
  const verifiedSkills = getAllUserSkills(profileOrResume);
  const matchResult = matchResumeToJob(profileOrResume, jobAnalysis);

  const matchedItems = matchResult.matchedItems || [];
  const partialItems = matchResult.partialItems || [];
  const missingItems = matchResult.missingItems || [];

  // Structure Matched category
  const matched = matchedItems.map(item => ({
    name: item.name,
    status: 'Matched',
    matchType: item.matchType || 'Verified',
    importance: item.importance || 'High',
    category: item.category || 'Technical',
    evidence: `Verified in candidate resume (${item.matchType || 'Exact'} match)`
  }));

  // Structure Partial category with recommendations
  const partial = partialItems.map(item => ({
    name: item.name,
    status: 'Partial',
    matchType: 'Partial / Related',
    importance: item.importance || 'Medium',
    category: item.category || 'Technical',
    recommendation: `Strengthen mention of ${item.name} in your project bullets or experience descriptions to ensure automated ATS keyword credit.`
  }));

  // Structure Missing category with strict anti-fabrication recommendations
  const missing = missingItems.map(item => {
    const priority = item.priority || 'required';
    return {
      name: item.name,
      status: 'Missing',
      priority: item.priority || 'Required',
      importance: item.importance || 'High',
      category: item.category || 'Technical',
      recommendation: `Consider learning ${item.name} because it is listed as a ${priority.toLowerCase()} technology in the supplied job description.`,
      antiFabricationNotice: `Do not pretend the candidate has ${item.name} if they have not used it. Build a hands-on project before adding.`
    };
  });

  // Categorize based on strict job criteria
  const criticalGaps = [];
  const importantGaps = [];
  const niceToHaveGaps = [];

  missing.forEach(item => {
    if (item.priority === 'Required' && item.importance === 'High') {
      criticalGaps.push(item);
    } else if (item.priority === 'Required' || item.importance === 'Medium') {
      importantGaps.push(item);
    } else {
      niceToHaveGaps.push(item);
    }
  });

  // Generate learning roadmaps for the gaps
  const roadmaps = [];
  const allGaps = [...criticalGaps, ...importantGaps, ...niceToHaveGaps];

  allGaps.slice(0, 6).forEach(gapItem => {
    const key = gapItem.name.toLowerCase();
    const details = SKILL_ROADMAP_DETAILS[key] || {
      whyItMatters: `Crucial capability listed as ${gapItem.priority} for modern software engineering workflows.`,
      prerequisites: ['Fundamental programming', 'Git version control', 'Software development lifecycle'],
      topics: [`Core syntax and configuration of ${gapItem.name}`, `Best practices & common design patterns in ${gapItem.name}`, `Integrating ${gapItem.name} into full-stack architectures`],
      suggestedProject: `Build a dedicated proof-of-concept module applying ${gapItem.name} within an existing project.`,
      estimatedLevel: gapItem.priority === 'Required' ? 'Intermediate' : 'Beginner to Intermediate',
      estimatedTime: '1 - 2 weeks'
    };

    roadmaps.push({
      skill: gapItem.name,
      category: gapItem.category,
      priority: gapItem.priority,
      classification: gapItem.priority === 'Required' && gapItem.importance === 'High' ? 'Critical' : (gapItem.priority === 'Required' ? 'Important' : 'Nice to Have'),
      recommendation: gapItem.recommendation,
      ...details
    });
  });

  // All role requirements flattened
  const roleRequirements = [
    ...(jobAnalysis.requiredSkills || []).map(s => typeof s === 'string' ? { name: s, priority: 'Required' } : { name: s.name, priority: 'Required', importance: s.importance || 'High' }),
    ...(jobAnalysis.preferredSkills || []).map(s => typeof s === 'string' ? { name: s, priority: 'Preferred' } : { name: s.name, priority: 'Preferred', importance: s.importance || 'Medium' })
  ];

  return {
    verifiedCount: verifiedSkills.length,
    missingCount: missingItems.length,
    yourSkills: verifiedSkills,
    roleRequirements,
    matched,
    partial,
    missing,
    criticalGaps,
    importantGaps,
    niceToHaveGaps,
    roadmaps
  };
}

module.exports = { analyzeSkillGaps, SKILL_ROADMAP_DETAILS };
