import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  SendNotificationDto,
  SubscribeDto,
  MessageDto,
} from './dto/notification.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  // เก็บข้อมูล clients ที่เชื่อมต่ออยู่
  private connectedClients: Map<string, { socket: Socket; connectedAt: Date }> =
    new Map();

  afterInit(): void {
    try {
      this.logger.log('WebSocket Gateway initialized');
    } catch (error) {
      this.logger.error(
        'Failed to initialize WebSocket Gateway',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  handleConnection(client: Socket): void {
    try {
      // เพิ่ม client ใหม่เข้า Map
      this.connectedClients.set(client.id, {
        socket: client,
        connectedAt: new Date(),
      });

      this.logger.log(
        `Client connected: ${client.id} | Total clients: ${this.connectedClients.size}`,
      );

      // ส่งข้อความต้อนรับไปยัง client ที่เพิ่งเชื่อมต่อ
      client.emit('welcome', {
        message: `Welcome! Your client ID is: ${client.id}`,
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        `Error handling connection: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  handleDisconnect(client: Socket): void {
    try {
      // ลบ client ออกจาก Map
      this.connectedClients.delete(client.id);

      this.logger.log(
        `Client disconnected: ${client.id} | Total clients: ${this.connectedClients.size}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling disconnection: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * รับข้อความจาก client แล้วตอบกลับด้วย "Hello " + ข้อความที่ได้รับ
   * แต่ละ client ทำงานแยกกัน - ตอบกลับเฉพาะ client ที่ส่งมา
   */
  @SubscribeMessage('message')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleMessage(
    @MessageBody() payload: MessageDto,
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      this.logger.log(`Message received from ${client.id}: ${payload.text}`);

      const response = {
        message: `Hello ${payload.text}`,
        clientId: client.id,
        timestamp: new Date().toISOString(),
      };

      // ตอบกลับเฉพาะ client ที่ส่งข้อความมา (ไม่ broadcast)
      client.emit('response', response);

      this.logger.log(`Response sent to ${client.id}: ${response.message}`);
    } catch (error) {
      this.logger.error(
        `Error handling message from ${client.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      client.emit('error', { message: 'Failed to process message' });
    }
  }

  /**
   * ดึงจำนวน clients ที่เชื่อมต่ออยู่
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * ดึงรายการ client IDs ทั้งหมด
   */
  getConnectedClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * ส่ง notification ไปยัง clients ทั้งหมด
   */
  @SubscribeMessage('sendNotification')
  @UsePipes(new ValidationPipe({ transform: true }))
  handleSendNotification(
    @MessageBody() payload: SendNotificationDto,
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      this.logger.log(
        `Notification received from ${client.id}: ${payload.message}`,
      );

      const notification = {
        event: payload.event,
        message: payload.message,
        data: payload.data || {},
        timestamp: new Date().toISOString(),
        from: client.id,
      };

      this.server.emit('notification', notification);
      this.logger.log(
        `Notification broadcasted: ${JSON.stringify(notification)}`,
      );
    } catch (error) {
      this.logger.error(
        'Error handling send notification',
        error instanceof Error ? error.stack : String(error),
      );
      client.emit('error', { message: 'Failed to send notification' });
    }
  }

  /**
   * Subscribe to a room
   */
  @SubscribeMessage('subscribe')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSubscribe(
    @MessageBody() payload: SubscribeDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      await client.join(payload.room);
      this.logger.log(
        `Client ${client.id} subscribed to room: ${payload.room}`,
      );
      client.emit('subscribed', { room: payload.room, success: true });
    } catch (error) {
      this.logger.error(
        `Error subscribing to room: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      client.emit('error', { message: 'Failed to subscribe to room' });
    }
  }

  /**
   * Unsubscribe from a room
   */
  @SubscribeMessage('unsubscribe')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleUnsubscribe(
    @MessageBody() payload: SubscribeDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      await client.leave(payload.room);
      this.logger.log(
        `Client ${client.id} unsubscribed from room: ${payload.room}`,
      );
      client.emit('unsubscribed', { room: payload.room, success: true });
    } catch (error) {
      this.logger.error(
        `Error unsubscribing from room: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      client.emit('error', { message: 'Failed to unsubscribe from room' });
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
      const payload = {
        event: notification.event,
        message: notification.message,
        data: notification.data || {},
        timestamp: new Date().toISOString(),
      };

      this.server.to(room).emit('notification', payload);
      this.logger.log(
        `Notification sent to room ${room}: ${JSON.stringify(payload)}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending notification to room ${room}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Broadcast notification ไปยังทุก clients
   */
  broadcastNotification(notification: SendNotificationDto): void {
    try {
      const payload = {
        event: notification.event,
        message: notification.message,
        data: notification.data || {},
        timestamp: new Date().toISOString(),
      };

      this.server.emit('notification', payload);
      this.logger.log(`Broadcast notification: ${JSON.stringify(payload)}`);
    } catch (error) {
      this.logger.error(
        'Error broadcasting notification',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
