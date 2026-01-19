import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      if (!chatRequest.question || chatRequest.question.trim() === '') {
        throw new HttpException(
          'Question is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.chatService.chat(chatRequest);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle Qdrant connection issues or other errors
      const errorMessage = (error as Error).message || 'Unknown error';
      if (
        errorMessage.includes('Qdrant') ||
        errorMessage.includes('connection')
      ) {
        throw new HttpException(
          'Failed to connect to Qdrant service',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        'Failed to process chat request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
