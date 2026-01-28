import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import { EmbeddingService } from './services/embedding.service';
import { QdrantService } from './services/qdrant.service';
import { ChatModule } from './chat/chat.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://admin:password@localhost:27017/employeedb?authSource=admin',
    ),
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
    ChatModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmbeddingService, QdrantService],
})
export class AppModule {}
