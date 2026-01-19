import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { EmbeddingService } from '../services/embedding.service';
import { QdrantService } from '../services/qdrant.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, EmbeddingService, QdrantService],
})
export class ChatModule {}
