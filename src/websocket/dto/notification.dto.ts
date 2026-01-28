import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class SendNotificationDto {
  @IsNotEmpty()
  @IsString()
  event: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

export class SubscribeDto {
  @IsNotEmpty()
  @IsString()
  room: string;
}

export class MessageDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}

