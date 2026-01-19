import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ChatController', () => {
  let controller: ChatController;
  let service: ChatService;

  const mockChatService = {
    chat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('should return a chat response with answer and source docs', async () => {
      const mockRequest = { question: 'Who is the senior engineer?' };
      const mockResponse = {
        answer: 'John Doe is a Senior Software Engineer.',
        source_docs: [
          {
            name: 'John Doe',
            position: 'Senior Software Engineer',
            department: 'Engineering',
            email: 'john.doe@example.com',
            skills: ['JavaScript', 'TypeScript'],
            bio: 'Experienced developer',
          },
        ],
      };

      mockChatService.chat.mockResolvedValue(mockResponse);

      const result = await controller.chat(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockChatService.chat).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle Qdrant connection errors', async () => {
      const mockRequest = { question: 'Valid question' };
      mockChatService.chat.mockRejectedValue(
        new Error('Qdrant connection failed'),
      );

      await expect(controller.chat(mockRequest)).rejects.toThrow(
        new HttpException(
          'Failed to connect to Qdrant service',
          HttpStatus.SERVICE_UNAVAILABLE,
        ),
      );
    });

    it('should handle generic errors', async () => {
      const mockRequest = { question: 'Valid question' };
      mockChatService.chat.mockRejectedValue(new Error('Unknown error'));

      await expect(controller.chat(mockRequest)).rejects.toThrow(
        new HttpException(
          'Failed to process chat request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
