import { IsNotEmpty, IsString } from 'class-validator';

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
    bio?: string;
    skills?: string[];
    email?: string;
  }>;
}
