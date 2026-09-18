const aiClient = require('./aiClient');

const KNOWN_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust', 'SQL', 'HTML', 'CSS', 'R', 'Scala'];
const KNOWN_FRAMEWORKS = ['React', 'React.js', 'Angular', 'Vue', 'Vue.js', 'Node.js', 'Express', 'Express.js', 'Spring Boot', 'Spring', 'Django', 'Flask', 'FastAPI', 'Next.js', 'Nest.js', 'ASP.NET', 'Ruby on Rails', 'Redux', 'Tailwind', 'Bootstrap'];
const KNOWN_DATABASES = ['MongoDB', 'PostgreSQL', 'Postgres', 'MySQL', 'Redis', 'SQLite', 'Oracle', 'Cassandra', 'DynamoDB', 'Elasticsearch', 'Firebase'];
const KNOWN_CLOUD = ['AWS', 'Amazon Web Services', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Serverless', 'Cloudflare'];
const KNOWN_TOOLS = ['Git', 'GitHub', 'GitLab', 'Jira', 'Postman', 'Figma', 'Linux', 'Webpack', 'Vite', 'Babel', 'VS Code'];
const KNOWN_SOFTSKILLS = ['Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Agile', 'Scrum', 'Critical Thinking', 'Collaboration', 'Adaptability', 'Mentorship'];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Heuristic fallback for extracting job information from text
 */
function heuristicExtractJob(text, providedTitle = '', providedCompany = '') {
  const lower = text.toLowerCase();

  const foundLangs = KNOWN_LANGUAGES.filter(item => {
    const rx = new RegExp(`\\b${escapeRegex(item)}\\b`, 'i');
    return rx.test(text);
  });

  const foundFrameworks = KNOWN_FRAMEWORKS.filter(item => {
    const rx = new RegExp(`\\b${escapeRegex(item)}\\b`, 'i');
    return rx.test(text);
  });

  const foundDbs = KNOWN_DATABASES.filter(item => {
    const rx = new RegExp(`\\b${escapeRegex(item)}\\b`, 'i');
    return rx.test(text);
  });

  const foundCloud = KNOWN_CLOUD.filter(item => {
    const rx = new RegExp(`\\b${escapeRegex(item)}\\b`, 'i');
    return rx.test(text);
  });

  const foundTools = KNOWN_TOOLS.filter(item => {
    const rx = new RegExp(`\\b${escapeRegex(item)}\\b`, 'i');
    return rx.test(text);
  });

  const foundSoft = KNOWN_SOFTSKILLS.filter(item => {
    const rx = new RegExp(`\\b${escapeRegex(item)}\\b`, 'i');
    return rx.test(text);
  });

  // Extract lines for responsibilities and requirements
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 5);
  const responsibilities = [];
  const educationReqs = [];
  const experienceReqs = [];

  lines.forEach(l => {
    const lowerL = l.toLowerCase();
    if (lowerL.includes('responsib') || lowerL.includes('you will') || lowerL.includes('what you\'ll do') || lowerL.startsWith('•') || lowerL.startsWith('-')) {
      if (responsibilities.length < 8 && l.length > 15) {
        responsibilities.push(l.replace(/^[•\-*]\s*/, ''));
      }
    }
    if (lowerL.includes('degree') || lowerL.includes('bachelor') || lowerL.includes('master') || lowerL.includes('b.tech') || lowerL.includes('b.s.')) {
      if (educationReqs.length < 3) educationReqs.push(l.replace(/^[•\-*]\s*/, ''));
    }
    if (lowerL.includes('years') && (lowerL.includes('experience') || lowerL.includes('exp'))) {
      if (experienceReqs.length < 3) experienceReqs.push(l.replace(/^[•\-*]\s*/, ''));
    }
  });

  if (responsibilities.length === 0) {
    responsibilities.push(
      'Collaborate with cross-functional product and engineering teams to design and build scalable features',
      'Maintain code quality, test coverage, and software design documentation',
      'Optimize application latency, scalability, and database query performance'
    );
  }

  if (educationReqs.length === 0) {
    educationReqs.push("Bachelor's or Master's degree in Computer Science, Engineering, or relevant technical field");
  }

  if (experienceReqs.length === 0) {
    experienceReqs.push('2+ years of professional software development experience in full-stack or backend engineering');
  }

  // Create structured requirements table
  const requirementsTable = [];

  foundLangs.forEach(name => {
    requirementsTable.push({
      name,
      category: 'Programming Language',
      priority: 'Required',
      importance: 'High'
    });
  });

  foundFrameworks.forEach((name, idx) => {
    requirementsTable.push({
      name,
      category: 'Framework',
      priority: idx < 2 ? 'Required' : 'Preferred',
      importance: idx < 2 ? 'High' : 'Medium'
    });
  });

  foundDbs.forEach((name, idx) => {
    requirementsTable.push({
      name,
      category: 'Database',
      priority: idx === 0 ? 'Required' : 'Preferred',
      importance: 'Medium'
    });
  });

  foundCloud.forEach((name, idx) => {
    requirementsTable.push({
      name,
      category: 'Cloud',
      priority: idx === 0 ? 'Required' : 'Preferred',
      importance: idx === 0 ? 'High' : 'Medium'
    });
  });

  foundTools.forEach(name => {
    requirementsTable.push({
      name,
      category: 'Tool',
      priority: 'Preferred',
      importance: 'Medium'
    });
  });

  foundSoft.forEach(name => {
    requirementsTable.push({
      name,
      category: 'Soft Skill',
      priority: 'Required',
      importance: 'Medium'
    });
  });

  // Action verbs and domain keywords
  const actionVerbs = ['Architect', 'Build', 'Develop', 'Deploy', 'Engineer', 'Optimize', 'Maintain', 'Collaborate', 'Lead'];
  const domainKeywords = ['Scalability', 'Microservices', 'REST APIs', 'Cloud Computing', 'Data Security', 'Clean Code'];

  return {
    extractedRole: providedTitle || 'Software Engineer',
    extractedCompany: providedCompany || 'Hiring Company',
    requiredSkills: [...foundLangs, ...foundFrameworks.slice(0, 2)],
    preferredSkills: [...foundFrameworks.slice(2), ...foundCloud, ...foundTools],
    programmingLanguages: foundLangs,
    frameworks: foundFrameworks,
    databases: foundDbs,
    cloudTechnologies: foundCloud,
    tools: foundTools,
    softSkills: foundSoft,
    responsibilities,
    educationRequirements: educationReqs,
    experienceRequirements: experienceReqs,
    certifications: [],
    domainKeywords,
    actionVerbs,
    requirementsTable
  };
}

/**
 * Main Job Analyzer function
 */
async function analyzeJobDescription(rawText, providedTitle = '', providedCompany = '') {
  if (aiClient.isConfigured()) {
    const prompt = `Analyze the following job description and return a detailed JSON object with:
{
  "extractedRole": "string",
  "extractedCompany": "string",
  "requiredSkills": ["string"],
  "preferredSkills": ["string"],
  "programmingLanguages": ["string"],
  "frameworks": ["string"],
  "databases": ["string"],
  "cloudTechnologies": ["string"],
  "tools": ["string"],
  "softSkills": ["string"],
  "responsibilities": ["string"],
  "educationRequirements": ["string"],
  "experienceRequirements": ["string"],
  "certifications": ["string"],
  "domainKeywords": ["string"],
  "actionVerbs": ["string"],
  "requirementsTable": [
    {
      "name": "string",
      "category": "Programming Language" | "Framework" | "Database" | "Cloud" | "Tool" | "Soft Skill" | "Qualification" | "Experience" | "Other",
      "priority": "Required" | "Preferred" | "Optional",
      "importance": "High" | "Medium" | "Low"
    }
  ]
}

JOB DESCRIPTION:
${rawText}`;

    const systemInstruction = 'You are an expert ATS parser and technical recruiter specializing in job requirement extraction.';
    const result = await aiClient.generateJSON(prompt, systemInstruction);
    if (result && Array.isArray(result.requirementsTable)) {
      return result;
    }
  }

  // Graceful fallback to rich local heuristic analyzer
  return heuristicExtractJob(rawText, providedTitle, providedCompany);
}

module.exports = { analyzeJobDescription, heuristicExtractJob };
