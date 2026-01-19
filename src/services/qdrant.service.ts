import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient;
  private collectionName: string;

  constructor() {
    const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    this.collectionName =
      process.env.QDRANT_COLLECTION_NAME || 'employee_embeddings';
    this.client = new QdrantClient({ url: qdrantUrl });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  /**
   * Ensure the collection exists, create it if not
   */
  private async ensureCollection() {
    try {
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col) => col.name === this.collectionName,
      );

      if (!collectionExists) {
        this.logger.log(`Creating collection: ${this.collectionName}`);
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 768, // Standard embedding size for most models
            distance: 'Cosine',
          },
        });
        this.logger.log('Collection created successfully');
      } else {
        this.logger.log(`Collection ${this.collectionName} already exists`);
      }
    } catch (error) {
      this.logger.error(
        `Error ensuring collection: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Upsert a point (employee embedding) into Qdrant
   */
  async upsertPoint(
    id: string,
    vector: number[],
    payload: Record<string, any>,
  ) {
    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: id,
            vector: vector,
            payload: payload,
          },
        ],
      });
      this.logger.log(`Upserted point with id: ${id}`);
    } catch (error) {
      this.logger.error(`Error upserting point: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Batch upsert multiple points into Qdrant
   */
  async upsertBatch(
    points: Array<{
      id: string;
      vector: number[];
      payload: Record<string, any>;
    }>,
  ) {
    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: points,
      });
      this.logger.log(`Batch upserted ${points.length} points`);
    } catch (error) {
      this.logger.error(`Error batch upserting: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Search for similar vectors in Qdrant
   */
  async search(vector: number[], limit: number = 5) {
    try {
      const results = await this.client.search(this.collectionName, {
        vector: vector,
        limit: limit,
      });
      return results;
    } catch (error) {
      this.logger.error(`Error searching: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get collection info
   */
  async getCollectionInfo() {
    try {
      return await this.client.getCollection(this.collectionName);
    } catch (error) {
      this.logger.error(
        `Error getting collection info: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
