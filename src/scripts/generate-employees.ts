import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { EmployeeDocument } from '../schemas/employee.schema';

/**
 * Script to generate 100 diverse employee records in MongoDB
 */
async function generateEmployees() {
  console.log('Starting employee generation script...');

  // Create a standalone NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    // Get employee model from the application context
    const employeeModel = app.get<Model<EmployeeDocument>>('EmployeeModel');

    // Check if employees already exist
    const existingCount = await employeeModel.countDocuments();
    console.log(`Current employee count: ${existingCount}`);

    if (existingCount > 0) {
      console.log('Employees already exist. Clearing existing data...');
      await employeeModel.deleteMany({});
      console.log('Existing data cleared.');
    }

    console.log('Generating 100 employee records...');

    // Generate 100 diverse employees
    const employees = generateEmployeeData(100);

    // Insert all employees
    await employeeModel.insertMany(employees);

    const finalCount = await employeeModel.countDocuments();
    console.log(`Successfully created ${finalCount} employee records!`);

    // Display some sample records
    console.log('\nSample employee records:');
    const samples = await employeeModel.find().limit(5).exec();
    samples.forEach((emp) => {
      console.log(`- ${emp.name} (${emp.position}) - ${emp.department}`);
    });
  } catch (error) {
    console.error('Error during employee generation:', error);
    throw error;
  } finally {
    await app.close();
  }
}

/**
 * Generate employee data with diverse positions, departments, and skills
 */
function generateEmployeeData(count: number) {
  const MIN_SKILLS = 3;
  const SKILL_RANGE = 4; // Will result in 3-6 skills per employee

  const firstNames = [
    'James',
    'Mary',
    'John',
    'Patricia',
    'Robert',
    'Jennifer',
    'Michael',
    'Linda',
    'William',
    'Elizabeth',
    'David',
    'Barbara',
    'Richard',
    'Susan',
    'Joseph',
    'Jessica',
    'Thomas',
    'Sarah',
    'Charles',
    'Karen',
    'Christopher',
    'Nancy',
    'Daniel',
    'Lisa',
    'Matthew',
    'Betty',
    'Anthony',
    'Margaret',
    'Mark',
    'Sandra',
    'Donald',
    'Ashley',
    'Steven',
    'Kimberly',
    'Paul',
    'Emily',
    'Andrew',
    'Donna',
    'Joshua',
    'Michelle',
    'Kenneth',
    'Carol',
    'Kevin',
    'Amanda',
    'Brian',
    'Dorothy',
    'George',
    'Melissa',
    'Timothy',
    'Deborah',
  ];

  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Gonzalez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Perez',
    'Thompson',
    'White',
    'Harris',
    'Sanchez',
    'Clark',
    'Ramirez',
    'Lewis',
    'Robinson',
    'Walker',
    'Young',
    'Allen',
    'King',
    'Wright',
    'Scott',
    'Torres',
    'Nguyen',
    'Hill',
    'Flores',
    'Green',
    'Adams',
    'Nelson',
    'Baker',
    'Hall',
    'Rivera',
    'Campbell',
    'Mitchell',
    'Carter',
    'Roberts',
  ];

  const departments = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Customer Success',
    'Human Resources',
    'Finance',
    'Operations',
    'Data & Analytics',
    'Security',
    'Infrastructure',
    'Quality Assurance',
    'Legal',
    'Research & Development',
  ];

  const positions: Record<string, string[]> = {
    Engineering: [
      'Senior Software Engineer',
      'Software Engineer',
      'Junior Software Engineer',
      'Staff Engineer',
      'Principal Engineer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Mobile Developer',
      'DevOps Engineer',
      'Site Reliability Engineer',
    ],
    Product: [
      'Product Manager',
      'Senior Product Manager',
      'Product Owner',
      'Technical Product Manager',
      'Associate Product Manager',
      'Chief Product Officer',
    ],
    Design: [
      'UX Designer',
      'UI Designer',
      'Product Designer',
      'Senior Designer',
      'Design Lead',
      'UX Researcher',
      'Graphic Designer',
    ],
    Marketing: [
      'Marketing Manager',
      'Content Strategist',
      'SEO Specialist',
      'Digital Marketing Manager',
      'Brand Manager',
      'Marketing Analyst',
      'Growth Manager',
    ],
    Sales: [
      'Sales Representative',
      'Account Executive',
      'Sales Manager',
      'Business Development Manager',
      'Sales Engineer',
      'Enterprise Account Manager',
    ],
    'Customer Success': [
      'Customer Success Manager',
      'Support Engineer',
      'Technical Support Specialist',
      'Customer Experience Manager',
      'Account Manager',
    ],
    'Human Resources': [
      'HR Manager',
      'Recruiter',
      'HR Business Partner',
      'Talent Acquisition Specialist',
      'People Operations Manager',
    ],
    Finance: [
      'Financial Analyst',
      'Accountant',
      'Finance Manager',
      'Controller',
      'Chief Financial Officer',
    ],
    Operations: [
      'Operations Manager',
      'Program Manager',
      'Project Manager',
      'Operations Analyst',
      'Business Operations Manager',
    ],
    'Data & Analytics': [
      'Data Scientist',
      'Data Engineer',
      'Data Analyst',
      'ML Engineer',
      'Analytics Manager',
      'Business Intelligence Analyst',
    ],
    Security: [
      'Security Engineer',
      'Security Analyst',
      'Information Security Manager',
      'Penetration Tester',
      'Security Architect',
    ],
    Infrastructure: [
      'Infrastructure Engineer',
      'Cloud Architect',
      'Network Engineer',
      'Systems Administrator',
      'Platform Engineer',
    ],
    'Quality Assurance': [
      'QA Engineer',
      'Test Automation Engineer',
      'QA Manager',
      'Quality Assurance Analyst',
    ],
    Legal: [
      'Legal Counsel',
      'Corporate Attorney',
      'Compliance Manager',
      'Legal Operations Manager',
    ],
    'Research & Development': [
      'Research Scientist',
      'R&D Engineer',
      'Innovation Manager',
      'Research Analyst',
    ],
  };

  const skillsByDepartment: Record<string, string[]> = {
    Engineering: [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'Go',
      'Rust',
      'React',
      'Angular',
      'Vue.js',
      'Node.js',
      'Django',
      'Flask',
      'Spring Boot',
      'Docker',
      'Kubernetes',
      'AWS',
      'Azure',
      'GCP',
      'MongoDB',
      'PostgreSQL',
      'Redis',
      'GraphQL',
      'REST API',
      'Microservices',
      'CI/CD',
      'Git',
    ],
    Product: [
      'Product Strategy',
      'Roadmap Planning',
      'User Research',
      'Agile',
      'Scrum',
      'A/B Testing',
      'Analytics',
      'Jira',
      'Confluence',
      'Product Marketing',
      'Stakeholder Management',
    ],
    Design: [
      'Figma',
      'Sketch',
      'Adobe XD',
      'Prototyping',
      'User Research',
      'Wireframing',
      'Design Systems',
      'Accessibility',
      'Visual Design',
      'Interaction Design',
      'User Testing',
    ],
    Marketing: [
      'SEO',
      'SEM',
      'Content Marketing',
      'Social Media',
      'Google Analytics',
      'Email Marketing',
      'Marketing Automation',
      'Copywriting',
      'Brand Strategy',
      'Campaign Management',
    ],
    Sales: [
      'Salesforce',
      'CRM',
      'Sales Strategy',
      'Negotiation',
      'Lead Generation',
      'Pipeline Management',
      'B2B Sales',
      'Enterprise Sales',
      'Account Management',
    ],
    'Customer Success': [
      'Customer Relationship Management',
      'Support Ticketing',
      'Zendesk',
      'Intercom',
      'Customer Onboarding',
      'Account Management',
      'Communication',
      'Problem Solving',
    ],
    'Human Resources': [
      'Recruiting',
      'Talent Management',
      'Employee Relations',
      'Performance Management',
      'Compensation',
      'HRIS',
      'Workday',
      'Interviewing',
    ],
    Finance: [
      'Financial Modeling',
      'Excel',
      'QuickBooks',
      'Financial Reporting',
      'Budgeting',
      'Forecasting',
      'Accounting',
      'Tax Compliance',
    ],
    Operations: [
      'Project Management',
      'Process Improvement',
      'Lean',
      'Six Sigma',
      'Operations Strategy',
      'Resource Planning',
      'Risk Management',
    ],
    'Data & Analytics': [
      'Python',
      'R',
      'SQL',
      'Machine Learning',
      'TensorFlow',
      'PyTorch',
      'Tableau',
      'Power BI',
      'Data Visualization',
      'Statistical Analysis',
      'Big Data',
      'Spark',
    ],
    Security: [
      'Penetration Testing',
      'Security Auditing',
      'Vulnerability Assessment',
      'Network Security',
      'Cryptography',
      'SIEM',
      'Incident Response',
      'Compliance',
    ],
    Infrastructure: [
      'AWS',
      'Azure',
      'GCP',
      'Terraform',
      'Ansible',
      'Linux',
      'Networking',
      'VMware',
      'Cloud Architecture',
    ],
    'Quality Assurance': [
      'Test Automation',
      'Selenium',
      'Jest',
      'Cypress',
      'Test Planning',
      'Bug Tracking',
      'API Testing',
      'Performance Testing',
    ],
    Legal: [
      'Contract Law',
      'Corporate Law',
      'Compliance',
      'Risk Management',
      'Legal Research',
      'Negotiation',
    ],
    'Research & Development': [
      'Research Methodology',
      'Data Analysis',
      'Innovation',
      'Prototyping',
      'Technical Writing',
      'Patent Research',
    ],
  };

  const bioTemplates = [
    'Experienced professional with {years} years in {field}. Passionate about {interest} and team collaboration.',
    'Skilled {position} specializing in {skill1} and {skill2}. Dedicated to delivering high-quality results.',
    '{years}-year veteran in {field} with expertise in {skill1}. Strong advocate for best practices and innovation.',
    'Dynamic professional with a background in {field}. Expert in {skill1} and {skill2} with a focus on continuous improvement.',
    'Results-driven {position} with {years} years of experience. Specializes in {skill1} and has a proven track record in {field}.',
    'Creative problem-solver with {years} years in {field}. Skilled in {skill1}, {skill2}, and driving impactful solutions.',
    'Dedicated {position} passionate about {interest}. Brings {years} years of expertise in {skill1} and {skill2}.',
    'Innovative professional with strong background in {field}. Specializes in {skill1} with {years} years of experience.',
  ];

  const interests = [
    'innovation',
    'team leadership',
    'continuous learning',
    'problem solving',
    'mentoring',
    'automation',
    'user experience',
    'scalability',
    'performance optimization',
    'best practices',
  ];

  const employees: Array<{
    name: string;
    email: string;
    position: string;
    department: string;
    skills: string[];
    bio: string;
    experience: number;
  }> = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastNameIndex = Math.floor(i / firstNames.length);
    const lastName = lastNames[lastNameIndex % lastNames.length];
    const name = `${firstName} ${lastName}`;

    // Distribute employees across departments
    const department = departments[i % departments.length];
    const departmentPositions = positions[department];
    const position = departmentPositions[i % departmentPositions.length];

    // Select 3-6 unique skills from the department's skill set
    const departmentSkills = skillsByDepartment[department] || [];
    const numSkills = Math.min(
      MIN_SKILLS + (i % SKILL_RANGE),
      departmentSkills.length,
    );
    const employeeSkills: string[] = [];

    // Use a simple approach: take consecutive skills starting from different offsets
    const startOffset = i % departmentSkills.length;
    for (let j = 0; j < numSkills; j++) {
      const skillIndex = (startOffset + j) % departmentSkills.length;
      employeeSkills.push(departmentSkills[skillIndex]);
    }

    // Generate experience (1-15 years)
    const experience = 1 + (i % 15);

    // Generate bio
    const bioTemplate = bioTemplates[i % bioTemplates.length];
    const field = department.toLowerCase();
    const interest = interests[i % interests.length];
    const skill1 = employeeSkills[0] || 'various technologies';
    const skill2 = employeeSkills[1] || 'modern practices';

    const bio = bioTemplate
      .replace('{years}', experience.toString())
      .replace('{field}', field)
      .replace('{interest}', interest)
      .replace('{position}', position.toLowerCase())
      .replace('{skill1}', skill1)
      .replace('{skill2}', skill2);

    // Generate email
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    employees.push({
      name,
      email,
      position,
      department,
      skills: employeeSkills,
      bio,
      experience,
    });
  }

  return employees;
}

// Run the script
generateEmployees()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
