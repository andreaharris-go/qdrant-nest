import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingService } from '../services/embedding.service';
import { QdrantService } from '../services/qdrant.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

interface EmployeePayload {
  name: string;
  position: string;
  department: string;
  bio?: string;
  skills?: string[];
  email?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private genAI: GoogleGenerativeAI;
  // Note: Using 'any' here as the Google Generative AI library doesn't export
  // specific types for the generative model. The library's type definitions
  // use 'any' internally for models.
  private model: any;

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not found, chat functionality will be limited',
      );
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
      });
    }
  }

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const { question } = chatRequest;

    try {
      // Step 1: Generate embedding for the question
      this.logger.log('Generating embedding for question');
      const questionEmbedding =
        await this.embeddingService.generateEmbedding(question);

      // Step 2: Retrieve relevant documents from Qdrant
      this.logger.log('Searching Qdrant for relevant documents');
      const searchResults = await this.qdrantService.search(
        questionEmbedding,
        5,
      );

      // Step 3: Build context from search results
      const sourceDocs: EmployeePayload[] = [];
      const contextParts: string[] = [];

      for (const result of searchResults) {
        const payload = result.payload as unknown as EmployeePayload;
        sourceDocs.push({
          name: payload.name,
          position: payload.position,
          department: payload.department,
          bio: payload.bio,
          skills: payload.skills,
          email: payload.email,
        });

        // Format employee data for context
        const employeeContext = [
          `Name: ${payload.name}`,
          `Position: ${payload.position}`,
          `Department: ${payload.department}`,
          payload.email ? `Email: ${payload.email}` : '',
          payload.skills && payload.skills.length > 0
            ? `Skills: ${payload.skills.join(', ')}`
            : '',
          payload.bio ? `Bio: ${payload.bio}` : '',
        ]
          .filter((line) => line)
          .join('\n');

        contextParts.push(employeeContext);
      }

      const context = contextParts.join('\n\n---\n\n');

      // Step 4: Generate answer using LLM
      if (!this.model) {
        return {
          answer:
            'LLM service is not configured. Please set GEMINI_API_KEY environment variable.',
          source_docs: sourceDocs,
        };
      }

      this.logger.log('Generating answer with LLM');
      const answer = await this.generateAnswer(question, context);

      return {
        answer,
        source_docs: sourceDocs,
      };
    } catch (error) {
      this.logger.error(`Error in chat service: ${(error as Error).message}`);
      throw error;
    }
  }

  private async generateAnswer(
    question: string,
    context: string,
  ): Promise<string> {
    const systemPrompt = `You are a helpful HR assistant. Answer the user's question using ONLY the context provided below. If the answer is not in the context, explicitly state that you do not have that information. Do not make up facts.

Context:
${context}`;

    const prompt = `${systemPrompt}

User Question: ${question}

Answer:`;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.model.generateContent(prompt);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const response = await result.response;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return response.text();
    } catch (error) {
      this.logger.error(
        `Error generating answer: ${(error as Error).message}`,
      );
      throw new Error('Failed to generate answer from LLM');
    }
  }
}
