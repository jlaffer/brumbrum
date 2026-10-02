var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User, Car, Reservation } from './entities/entities.js';
import { AppGateway } from './gateways/app.gateway.js';
import { NotificationService } from './notifications/notification.service.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            TypeOrmModule.forRoot({
                type: 'better-sqlite3',
                database: 'brumbrum.sqlite',
                entities: [User, Car, Reservation],
                synchronize: true,
            }),
            TypeOrmModule.forFeature([User, Car, Reservation]),
        ],
        controllers: [AppController],
        providers: [AppService, AppGateway, NotificationService],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map