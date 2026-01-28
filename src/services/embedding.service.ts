import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  private genAI: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not found, using placeholder embeddings',
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Generate embeddings for the given text using Gemini AI
   * Falls back to placeholder embeddings if API key is not configured
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!this.genAI) {
        // Return placeholder embedding if Gemini is not configured
        return this.generatePlaceholderEmbedding(text);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.genAI.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const embedding = result.embeddings?.[0]?.values;

      if (!embedding) {
        this.logger.warn('Invalid embedding response, using placeholder');
        return this.generatePlaceholderEmbedding(text);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return embedding;
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
    // Generate a deterministic 3072-dimensional vector based on text
    // Matches gemini-embedding-001 output dimensions
    const dimension = 3072;
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
