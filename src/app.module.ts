import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import { EmbeddingService } from './services/embedding.service';
import { QdrantService } from './services/qdrant.service';

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
  ],
  controllers: [AppController],
  providers: [AppService, EmbeddingService, QdrantService],
})
export class AppModule {}
