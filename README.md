# qdrant-nest

A NestJS workspace demonstrating integration between MongoDB, Qdrant vector database, and Gemini AI for employee data embeddings.

## Features

- **NestJS Application**: Modern TypeScript-based backend framework
- **MongoDB Integration**: Store and manage employee data using Mongoose
- **Qdrant Vector Database**: Store and search vector embeddings
- **Gemini AI**: Generate embeddings from employee data (with fallback to placeholder embeddings)
- **Docker Compose**: Easy setup for Qdrant and MongoDB services
- **Migration Script**: Automated data migration from MongoDB to Qdrant

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn
- Gemini API key (optional - will use placeholder embeddings if not provided)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd qdrant-nest
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key (optional):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

If you don't have a Gemini API key, the application will use placeholder embeddings.

### 4. Start Docker services

Start Qdrant and MongoDB using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **Qdrant** on port 6333 (HTTP) and 6334 (gRPC)
- **MongoDB** on port 27017

### 5. Generate employee data (Optional)

Generate 100 diverse employee records with various positions, departments, and skills:

```bash
npm run generate:employees
```

This script will:
1. Connect to MongoDB
2. Clear existing employee data (if any)
3. Generate 100 diverse employee records across 15 departments
4. Insert all records into MongoDB

### 6. Run the migration script

The migration script will:
1. Connect to MongoDB
2. Fetch employee data (or create sample data if none exists)
3. Generate embeddings for each employee
4. Upsert the embeddings into Qdrant

```bash
npm run migrate:employees
```

### 7. Start the NestJS application

```bash
npm run start:dev
```

The application will start on http://localhost:3000

## Project Structure

```
qdrant-nest/
├── src/
│   ├── schemas/
│   │   └── employee.schema.ts          # Mongoose schema for Employee
│   ├── services/
│   │   ├── embedding.service.ts        # Gemini AI embedding generation
│   │   └── qdrant.service.ts           # Qdrant operations
│   ├── scripts/
│   │   ├── generate-employees.ts       # Generate 100 employee records
│   │   └── migrate-employees.ts        # Data migration script
│   ├── app.module.ts                   # Main application module
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── docker-compose.yml              # Docker services configuration
├── .env.example                    # Environment variables template
└── package.json
```

## Services

### MongoDB

- **URL**: mongodb://admin:password@localhost:27017/employeedb?authSource=admin
- **Database**: employeedb
- **Collection**: employees
- **Credentials**: admin/password

### Qdrant

- **HTTP API**: http://localhost:6333
- **gRPC**: localhost:6334
- **Dashboard**: http://localhost:6333/dashboard
- **Collection**: employee_embeddings

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode
- `npm run start:prod` - Start in production mode
- `npm run generate:employees` - Generate 100 diverse employee records in MongoDB
- `npm run migrate:employees` - Run employee data migration from MongoDB to Qdrant
- `npm run build` - Build the application
- `npm run lint` - Lint the code
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Employee Schema

The employee schema includes:

```typescript
{
  name: string;          // Employee name
  email: string;         // Email address
  position: string;      // Job position
  department: string;    // Department
  skills: string[];      // Array of skills
  bio: string;          // Biography/description
  experience: number;    // Years of experience
}
```

## Embedding Generation

The application uses Gemini AI to generate embeddings. If a Gemini API key is not provided, it falls back to generating deterministic placeholder embeddings based on the text content.

Embeddings are 768-dimensional vectors that can be used for:
- Semantic search
- Finding similar employees
- Clustering by skills or expertise
- Recommendations

## Troubleshooting

### Docker services not starting

```bash
# Check if ports are already in use
lsof -i :6333  # Qdrant
lsof -i :27017 # MongoDB

# Restart services
docker-compose restart
```

### Migration script fails

1. Ensure Docker services are running: `docker-compose ps`
2. Check service logs: `docker-compose logs`
3. Verify environment variables in `.env`

### Connection errors

Wait a few seconds after starting Docker services for them to fully initialize before running the migration script.

### Testing Curl
```bash
curl --location 'http://localhost:3000/chat' \
--header 'Content-Type: application/json' \
--data '{
    "question": "ฉันต้องการจัดตั้งทีม AI คุณคิดว่าใครเหมาะสมที่สุด และเพราะอะไร" 
}'
```

## License

UNLICENSED
