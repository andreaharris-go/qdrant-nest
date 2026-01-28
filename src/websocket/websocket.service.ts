import { Injectable, Logger } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { SendNotificationDto } from './dto/notification.dto';

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);

  constructor(private readonly websocketGateway: WebsocketGateway) {}

  /**
   * ดึงจำนวน clients ที่เชื่อมต่ออยู่
   */
  getConnectedClientsCount(): number {
    return this.websocketGateway.getConnectedClientsCount();
  }

  /**
   * ดึงรายการ client IDs ทั้งหมด
   */
  getConnectedClientIds(): string[] {
    return this.websocketGateway.getConnectedClientIds();
  }

  /**
   * ส่ง notification ไปยังทุก clients
   */
  broadcastNotification(notification: SendNotificationDto): void {
    try {
      this.logger.log(`Broadcasting notification: ${notification.message}`);
      this.websocketGateway.broadcastNotification(notification);
    } catch (error) {
      this.logger.error(
        'Error broadcasting notification',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * ส่ง notification ไปยัง room เฉพาะ
   */
  sendNotificationToRoom(
    room: string,
    notification: SendNotificationDto,
  ): void {
    try {
      this.logger.log(
        `Sending notification to room ${room}: ${notification.message}`,
      );
      this.websocketGateway.sendNotificationToRoom(room, notification);
    } catch (error) {
      this.logger.error(
        `Error sending notification to room ${room}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
