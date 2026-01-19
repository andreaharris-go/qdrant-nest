import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { EmbeddingService } from '../services/embedding.service';
import { QdrantService } from '../services/qdrant.service';

describe('ChatService', () => {
  let service: ChatService;
  let embeddingService: EmbeddingService;
  let qdrantService: QdrantService;

  const mockEmbeddingService = {
    generateEmbedding: jest.fn(),
  };

  const mockQdrantService = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: EmbeddingService,
          useValue: mockEmbeddingService,
        },
        {
          provide: QdrantService,
          useValue: mockQdrantService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    embeddingService = module.get<EmbeddingService>(EmbeddingService);
    qdrantService = module.get<QdrantService>(QdrantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat', () => {
    it('should generate embedding and search Qdrant', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = [
        {
          id: '1',
          score: 0.9,
          payload: {
            name: 'John Doe',
            position: 'Senior Software Engineer',
            department: 'Engineering',
            email: 'john.doe@example.com',
            skills: ['JavaScript', 'TypeScript'],
            bio: 'Experienced developer',
          },
        },
      ];

      mockEmbeddingService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.search.mockResolvedValue(mockSearchResults);

      const result = await service.chat({
        question: 'Who is the senior engineer?',
      });

      expect(embeddingService.generateEmbedding).toHaveBeenCalledWith(
        'Who is the senior engineer?',
      );
      expect(qdrantService.search).toHaveBeenCalledWith(mockEmbedding, 5);
      expect(result.source_docs).toHaveLength(1);
      expect(result.source_docs[0].name).toBe('John Doe');
    });

    it('should return error message when GEMINI_API_KEY is not set', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = [
        {
          id: '1',
          score: 0.9,
          payload: {
            name: 'Jane Smith',
            position: 'Data Scientist',
            department: 'Data & Analytics',
          },
        },
      ];

      mockEmbeddingService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.search.mockResolvedValue(mockSearchResults);

      const result = await service.chat({
        question: 'Who is the data scientist?',
      });

      expect(result.answer).toContain(
        'LLM service is not configured. Please set GEMINI_API_KEY environment variable.',
      );
      expect(result.source_docs).toHaveLength(1);
    });

    it('should handle errors from embedding service', async () => {
      mockEmbeddingService.generateEmbedding.mockRejectedValue(
        new Error('Embedding generation failed'),
      );

      await expect(
        service.chat({ question: 'Test question' }),
      ).rejects.toThrow();
    });

    it('should handle errors from Qdrant service', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      mockEmbeddingService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.search.mockRejectedValue(
        new Error('Qdrant search failed'),
      );

      await expect(
        service.chat({ question: 'Test question' }),
      ).rejects.toThrow();
    });

    it('should format employee data correctly in context', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockSearchResults = [
        {
          id: '1',
          score: 0.9,
          payload: {
            name: 'Bob Johnson',
            position: 'DevOps Engineer',
            department: 'Infrastructure',
            email: 'bob.johnson@example.com',
            skills: ['Docker', 'Kubernetes', 'AWS'],
            bio: 'DevOps expert with cloud infrastructure experience',
          },
        },
      ];

      mockEmbeddingService.generateEmbedding.mockResolvedValue(mockEmbedding);
      mockQdrantService.search.mockResolvedValue(mockSearchResults);

      const result = await service.chat({
        question: 'Who is the DevOps engineer?',
      });

      expect(result.source_docs).toHaveLength(1);
      expect(result.source_docs[0]).toEqual({
        name: 'Bob Johnson',
        position: 'DevOps Engineer',
        department: 'Infrastructure',
        email: 'bob.johnson@example.com',
        skills: ['Docker', 'Kubernetes', 'AWS'],
        bio: 'DevOps expert with cloud infrastructure experience',
      });
    });
  });
});
