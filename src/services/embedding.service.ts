import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not found, using placeholder embeddings',
      );
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'embedding-001',
      });
    }
  }

  /**
   * Generate embeddings for the given text using Gemini AI
   * Falls back to placeholder embeddings if API key is not configured
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!this.model) {
        // Return placeholder embedding if Gemini is not configured
        return this.generatePlaceholderEmbedding(text);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.model.embedContent(text);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const embedding = result.embedding;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!embedding || !embedding.values) {
        this.logger.warn('Invalid embedding response, using placeholder');
        return this.generatePlaceholderEmbedding(text);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      return embedding.values;
    } catch (error) {
      this.logger.error(
        `Error generating embedding: ${(error as Error).message}`,
      );
      this.logger.warn('Falling back to placeholder embedding');
      return this.generatePlaceholderEmbedding(text);
    }
  }

  /**
   * Generate a simple placeholder embedding based on text content
   * This is used when Gemini API is not available
   */
  private generatePlaceholderEmbedding(text: string): number[] {
    // Generate a deterministic 768-dimensional vector based on text
    const dimension = 768;
    const embedding: number[] = [];
    const seed = this.hashString(text);

    for (let i = 0; i < dimension; i++) {
      // Simple pseudo-random number generation
      const x = Math.sin(seed + i) * 10000;
      embedding.push(x - Math.floor(x));
    }

    // Normalize the vector
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0),
    );
    return embedding.map((val) => val / magnitude);
  }

  /**
   * Simple hash function for generating seed from string
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
