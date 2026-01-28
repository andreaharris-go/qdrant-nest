# Prompt Template สำหรับสร้าง Module ใหม่ใน NestJS + Qdrant Project

## Context ของ Project

โปรเจคนี้เป็น NestJS application ที่ใช้:
- **NestJS** - Framework หลัก
- **Qdrant** - Vector database สำหรับ semantic search
- **MongoDB + Mongoose** - Database หลัก
- **Google Generative AI (Gemini)** - สำหรับ embeddings และ chat
- **class-validator & class-transformer** - สำหรับ validation

## โครงสร้างของ Module ใน Project นี้

```
src/
  [module-name]/
    [module-name].module.ts        # Module definition
    [module-name].controller.ts    # REST API endpoints
    [module-name].service.ts       # Business logic
    [module-name].controller.spec.ts # Controller tests
    [module-name].service.spec.ts  # Service tests
    dto/
      [module-name].dto.ts         # Data Transfer Objects
```

## Prompt Template

```
ช่วยสร้าง NestJS module ใหม่ชื่อ [MODULE_NAME] ที่มีฟังก์ชันดังนี้:

[อธิบายฟังก์ชันการทำงานที่ต้องการ]

### ความต้องการเพิ่มเติม:

1. **API Endpoints ที่ต้องการ:**
   - [HTTP_METHOD] /[route] - [คำอธิบาย]
   - [HTTP_METHOD] /[route] - [คำอธิบาย]

2. **Database Schema (ถ้ามี):**
   - ต้องการใช้ MongoDB: [ใช่/ไม่]
   - Fields ที่ต้องการ: [ระบุ fields และ types]

3. **Vector Search / Embeddings (ถ้าใช้):**
   - ต้องการ integration กับ Qdrant: [ใช่/ไม่]
   - Collection name: [ชื่อ collection]
   - Fields ที่ต้องการทำ embedding: [ระบุ fields]

4. **Services ที่ต้องใช้:**
   - [ ] EmbeddingService - สำหรับสร้าง embeddings
   - [ ] QdrantService - สำหรับทำงานกับ Qdrant
   - [ ] Services อื่นๆ: [ระบุ]

5. **Validation Requirements:**
   - [ระบุ validation rules สำหรับแต่ละ DTO]

### โครงสร้างไฟล์ที่ต้องสร้าง:

1. **Module File** (`src/[module-name]/[module-name].module.ts`)
   - Import controllers, providers ที่จำเป็น
   - รวม EmbeddingService และ QdrantService ถ้าต้องใช้

2. **Controller File** (`src/[module-name]/[module-name].controller.ts`)
   - ใช้ decorators: @Controller, @Post, @Get, @Put, @Delete, @Body, @Param
   - มี error handling ด้วย HttpException
   - ส่ง appropriate HTTP status codes

3. **Service File** (`src/[module-name]/[module-name].service.ts`)
   - ใช้ @Injectable() decorator
   - มี Logger สำหรับ logging
   - Inject services ที่จำเป็น (EmbeddingService, QdrantService, etc.)

4. **DTO Files** (`src/[module-name]/dto/[module-name].dto.ts`)
   - ใช้ class-validator decorators (@IsNotEmpty, @IsString, @IsNumber, etc.)
   - แยก Request DTOs และ Response DTOs

5. **Schema File** (ถ้าใช้ MongoDB) (`src/schemas/[model-name].schema.ts`)
   - ใช้ @nestjs/mongoose
   - กำหนด @Schema() และ @Prop() decorators

6. **Test Files** (Optional)
   - `[module-name].controller.spec.ts`
   - `[module-name].service.spec.ts`

### การ Register Module:

อย่าลืมเพิ่ม module ใน `src/app.module.ts`:
```typescript
import { [ModuleName]Module } from './[module-name]/[module-name].module';

@Module({
  imports: [
    // ...existing imports
    [ModuleName]Module,
  ],
  // ...
})
```

### Best Practices:

1. ใช้ async/await สำหรับ operations ที่ใช้เวลา
2. มี try-catch blocks สำหรับ error handling
3. ใช้ Logger สำหรับ log important events
4. Validate input ด้วย class-validator
5. ใช้ proper TypeScript types
6. ถ้าใช้ Qdrant:
   - ตรวจสอบว่า collection มีอยู่แล้วหรือไม่ก่อนสร้าง
   - ใช้ consistent vector dimensions (ตาม embedding model)
   - Handle connection errors gracefully

### Environment Variables (ถ้าต้องการเพิ่ม):

ระบุ environment variables ที่ต้องเพิ่มใน `.env`:
- [VAR_NAME]=[description]
```

## ตัวอย่างการใช้งาน Prompt

### ตัวอย่างที่ 1: Module สำหรับจัดการ Products

```
ช่วยสร้าง NestJS module ใหม่ชื่อ product ที่มีฟังก์ชันดังนี้:

ระบบจัดการสินค้าที่มีการค้นหาด้วย semantic search โดยใช้ชื่อและคำอธิบายของสินค้า

### ความต้องการเพิ่มเติม:

1. **API Endpoints ที่ต้องการ:**
   - POST /product - สร้างสินค้าใหม่และเพิ่มเข้า Qdrant
   - GET /product/:id - ดึงข้อมูลสินค้าตาม ID
   - POST /product/search - ค้นหาสินค้าด้วย semantic search
   - PUT /product/:id - อัพเดทข้อมูลสินค้า
   - DELETE /product/:id - ลบสินค้า

2. **Database Schema (ถ้ามี):**
   - ต้องการใช้ MongoDB: ใช่
   - Fields ที่ต้องการ:
     * name: string (required)
     * description: string (required)
     * price: number (required)
     * category: string (required)
     * tags: string[] (optional)
     * sku: string (required, unique)
     * inStock: boolean (default: true)

3. **Vector Search / Embeddings (ถ้าใช้):**
   - ต้องการ integration กับ Qdrant: ใช่
   - Collection name: products
   - Fields ที่ต้องการทำ embedding: รวม name + description + tags

4. **Services ที่ต้องใช้:**
   - [x] EmbeddingService - สำหรับสร้าง embeddings
   - [x] QdrantService - สำหรับทำงานกับ Qdrant
   - Services อื่นๆ: -

5. **Validation Requirements:**
   - name: ไม่ว่าง, string, length 3-200
   - description: ไม่ว่าง, string, length 10-2000
   - price: positive number
   - sku: ไม่ว่าง, alphanumeric
   - category: ไม่ว่าง, string
```

### ตัวอย่างที่ 2: Module สำหรับ Analytics (ไม่ใช้ Qdrant)

```
ช่วยสร้าง NestJS module ใหม่ชื่อ analytics ที่มีฟังก์ชันดังนี้:

ระบบติดตามและวิเคราะห์การใช้งานของผู้ใช้ในระบบ

### ความต้องการเพิ่มเติม:

1. **API Endpoints ที่ต้องการ:**
   - POST /analytics/track - บันทึก event ของผู้ใช้
   - GET /analytics/dashboard - ดึงข้อมูล dashboard summary
   - GET /analytics/events/:userId - ดึง events ของผู้ใช้
   - GET /analytics/report - สร้าง report ตามช่วงเวลา

2. **Database Schema (ถ้ามี):**
   - ต้องการใช้ MongoDB: ใช่
   - Fields ที่ต้องการ:
     * userId: string (required)
     * eventType: string (required)
     * eventData: object (optional)
     * timestamp: Date (required, default: now)
     * sessionId: string (optional)
     * ipAddress: string (optional)

3. **Vector Search / Embeddings (ถ้าใช้):**
   - ต้องการ integration กับ Qdrant: ไม่

4. **Services ที่ต้องใช้:**
   - Services อื่นๆ: -

5. **Validation Requirements:**
   - userId: ไม่ว่าง, string
   - eventType: ไม่ว่าง, string, enum ['click', 'view', 'search', 'purchase']
   - timestamp: valid date
```

## Reference: โครงสร้างของ Chat Module (ตัวอย่าง)

โครงสร้างที่มีอยู่แล้วใน project:

```typescript
// chat.module.ts
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
```

```typescript
// chat.controller.ts - Pattern ที่ใช้
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      return await this.chatService.chat(chatRequest);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      if (errorMessage.includes('Qdrant') || errorMessage.includes('connection')) {
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
```

```typescript
// chat.service.ts - Pattern ที่ใช้
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly qdrantService: QdrantService,
  ) {}

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    // Implementation
  }
}
```

```typescript
// dto/chat.dto.ts - Pattern ที่ใช้
export class ChatRequestDto {
  @IsNotEmpty()
  @IsString()
  question: string;
}

export class ChatResponseDto {
  answer: string;
  source_docs: Array<{
    name: string;
    position: string;
    department: string;
  }>;
}
```

## Tips สำหรับการใช้ Template

1. **แทนที่ค่าใน [BRACKETS]** ด้วยค่าจริงที่ต้องการ
2. **ระบุรายละเอียดให้ชัดเจน** - ยิ่งให้รายละเอียดมาก AI จะสร้างโค้ดที่ตรงความต้องการมากขึ้น
3. **เช็ค Dependencies** - ถ้าต้องการใช้ library เพิ่มเติม ระบุไว้ใน prompt
4. **Test หลังสร้าง** - อย่าลืมทดสอบ module ที่สร้างขึ้นมา
5. **Follow Project Conventions** - ใช้ naming conventions และ patterns เดียวกับที่มีอยู่ใน project

## Checklist หลังสร้าง Module

- [ ] สร้างไฟล์ module, controller, service, dto ครบถ้วน
- [ ] Register module ใน app.module.ts
- [ ] เพิ่ม schema ใน schemas/ (ถ้าใช้ MongoDB)
- [ ] Register schema ใน app.module.ts ด้วย MongooseModule.forFeature()
- [ ] เพิ่ม environment variables ใน .env (ถ้ามี)
- [ ] Run `npm run lint` เพื่อตรวจสอบ code style
- [ ] Run `npm run build` เพื่อตรวจสอบ TypeScript errors
- [ ] ทดสอบ endpoints ด้วย Postman หรือ curl
- [ ] เขียน tests (controller.spec.ts และ service.spec.ts)
- [ ] อัพเดท README.md ด้วย API documentation

## คำสั่งที่เป็นประโยชน์

```powershell
# สร้าง module, controller, service ด้วย NestJS CLI
nest g module [module-name]
nest g controller [module-name]
nest g service [module-name]

# หรือสร้างทั้งหมดพร้อมกัน
nest g resource [module-name]

# Run development server
npm run start:dev

# Run linter
npm run lint

# Run tests
npm run test
```

---

**หมายเหตุ:** Template นี้ออกแบบมาสำหรับ project ที่ใช้ NestJS + Qdrant + MongoDB โดยเฉพาะ อาจต้องปรับแต่งตามความต้องการของแต่ละ project
