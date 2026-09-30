import { Controller, Get, Post, Body, Patch, Param, Delete, Header } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ReservationStatus } from './entities/entities.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getUsers() {
    return this.appService.getUsers();
  }

  @Post('users')
  createUser(@Body() data: any) {
    return this.appService.createUser(data);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.appService.updateUser(+id, data);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.appService.deleteUser(+id);
  }

  @Get('cars')
  getCars() {
    return this.appService.getCars();
  }

  @Post('cars')
  createCar(@Body() data: any) {
    return this.appService.createCar(data);
  }

  @Get('reservations')
  getReservations() {
    return this.appService.getReservations();
  }

  @Post('reservations')
  createReservation(@Body() data: any) {
    return this.appService.createReservation(data);
  }

  @Patch('reservations/:id')
  updateReservation(@Param('id') id: string, @Body() data: any) {
    return this.appService.updateReservation(+id, data);
  }

  @Patch('reservations/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: ReservationStatus) {
    return this.appService.updateReservationStatus(+id, status);
  }

  @Patch('reservations/:id/complete')
  complete(@Param('id') id: string, @Body('endMileage') endMileage: number) {
    return this.appService.completeReservation(+id, endMileage);
  }

  @Get('calendar/ics')
  @Header('Content-Type', 'text/calendar')
  @Header('Content-Disposition', 'attachment; filename="brumbrum.ics"')
  async getCalendarIcs() {
    return this.appService.getCalendarIcs();
  }
}
