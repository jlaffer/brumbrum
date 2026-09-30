import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { User, Car, Reservation } from './entities/entities.js';
import { AppGateway } from './gateways/app.gateway.js';

@Module({
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
  providers: [AppService, AppGateway],
})
export class AppModule {}
