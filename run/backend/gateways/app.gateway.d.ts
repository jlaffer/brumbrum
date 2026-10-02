import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
export declare class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
    notifyCarUpdate(): void;
    notifyReservationUpdate(): void;
    notifyUserUpdate(): void;
}
