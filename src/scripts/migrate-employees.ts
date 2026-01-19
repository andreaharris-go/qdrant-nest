import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { EmployeeDocument } from '../schemas/employee.schema';
import { EmbeddingService } from '../services/embedding.service';
import { QdrantService } from '../services/qdrant.service';

/**
 * Migration script to fetch employee data from MongoDB,
 * generate embeddings using Gemini AI, and upsert them into Qdrant
 */
async function migrateEmployeeData() {
  console.log('Starting employee data migration...');

  // Create a standalone NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    // Get services from the application context
    const employeeModel = app.get<Model<EmployeeDocument>>('EmployeeModel');
    const embeddingService = app.get(EmbeddingService);
    const qdrantService = app.get(QdrantService);

    // Wait a bit for Qdrant to initialize its collection
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Fetching employees from MongoDB...');
    const employees = await employeeModel.find().exec();
    console.log(`Found ${employees.length} employees`);

    if (employees.length === 0) {
      console.log('No employees found in database.');
      console.log('Creating sample employee data...');

      // Create sample employee data
      const sampleEmployees = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          position: 'Senior Software Engineer',
          department: 'Engineering',
          skills: ['JavaScript', 'TypeScript', 'Node.js', 'React'],
          bio: 'Experienced full-stack developer with 8 years of experience in web development. Passionate about clean code and agile methodologies.',
          experience: 8,
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          position: 'Data Scientist',
          department: 'Data & Analytics',
          skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
          bio: 'Data scientist specializing in machine learning and predictive analytics. PhD in Computer Science with focus on AI.',
          experience: 5,
        },
        {
          name: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          position: 'DevOps Engineer',
          department: 'Infrastructure',
          skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
          bio: 'DevOps engineer with expertise in cloud infrastructure and CI/CD pipelines. Strong background in automation.',
          experience: 6,
        },
        {
          name: 'Alice Williams',
          email: 'alice.williams@example.com',
          position: 'Product Manager',
          department: 'Product',
          skills: ['Agile', 'Scrum', 'Product Strategy', 'User Research'],
          bio: 'Product manager with a track record of launching successful products. Expert in agile methodologies and user-centric design.',
          experience: 7,
        },
        {
          name: 'Charlie Brown',
          email: 'charlie.brown@example.com',
          position: 'UX Designer',
          department: 'Design',
          skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
          bio: 'Creative UX designer focused on creating intuitive and beautiful user experiences. Strong advocate for accessibility.',
          experience: 4,
        },
      ];

      await employeeModel.insertMany(sampleEmployees);
      console.log(`Created ${sampleEmployees.length} sample employees`);

      // Fetch the newly created employees
      const newEmployees = await employeeModel.find().exec();
      await processEmployees(newEmployees, embeddingService, qdrantService);
    } else {
      await processEmployees(employees, embeddingService, qdrantService);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await app.close();
  }
}

/**
 * Process employees: generate embeddings and upsert to Qdrant
 */
async function processEmployees(
  employees: EmployeeDocument[],
  embeddingService: EmbeddingService,
  qdrantService: QdrantService,
) {
  console.log(`Processing ${employees.length} employees...`);

  const batchSize = 10;
  for (let i = 0; i < employees.length; i += batchSize) {
    const batch = employees.slice(i, i + batchSize);
    const points: Array<{
      id: string;
      vector: number[];
      payload: Record<string, any>;
    }> = [];

    for (const employee of batch) {
      try {
        // Create a text representation of the employee for embedding
        const employeeText = createEmployeeText(employee);

        console.log(`Generating embedding for: ${employee.name}`);
        const embedding =
          await embeddingService.generateEmbedding(employeeText);

        // Prepare point for Qdrant
        points.push({
          id: employee._id.toString(),
          vector: embedding,
          payload: {
            name: employee.name,
            email: employee.email,
            position: employee.position,
            department: employee.department,
            skills: employee.skills,
            bio: employee.bio,
            experience: employee.experience,
          },
        });
      } catch (error) {
        console.error(`Error processing employee ${employee.name}:`, error);
      }
    }

    if (points.length > 0) {
      console.log(`Upserting batch of ${points.length} employees to Qdrant...`);
      await qdrantService.upsertBatch(points);
    }
  }

  console.log('All employees processed!');

  // Display collection info
  const collectionInfo = await qdrantService.getCollectionInfo();
  console.log('Collection info:', JSON.stringify(collectionInfo, null, 2));
}

/**
 * Create a text representation of an employee for embedding generation
 */
function createEmployeeText(employee: EmployeeDocument): string {
  const parts = [
    `Name: ${employee.name}`,
    `Position: ${employee.position}`,
    `Department: ${employee.department}`,
    `Skills: ${employee.skills?.join(', ') || 'N/A'}`,
    `Bio: ${employee.bio || 'N/A'}`,
    `Experience: ${employee.experience} years`,
  ];
  return parts.join('. ');
}

// Run the migration
migrateEmployeeData()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
