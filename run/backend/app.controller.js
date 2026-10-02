var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Body, Patch, Param, Delete, Header } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ReservationStatus } from './entities/entities.js';
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getUsers() {
        return this.appService.getUsers();
    }
    createUser(data) {
        return this.appService.createUser(data);
    }
    updateUser(id, data) {
        return this.appService.updateUser(+id, data);
    }
    deleteUser(id) {
        return this.appService.deleteUser(+id);
    }
    getCars() {
        return this.appService.getCars();
    }
    createCar(data) {
        return this.appService.createCar(data);
    }
    updateCar(id, data) {
        return this.appService.updateCar(+id, data);
    }
    getReservations() {
        return this.appService.getReservations();
    }
    createReservation(data) {
        return this.appService.createReservation(data);
    }
    updateReservation(id, data) {
        return this.appService.updateReservation(+id, data);
    }
    updateStatus(id, status) {
        return this.appService.updateReservationStatus(+id, status);
    }
    complete(id, endMileage) {
        return this.appService.completeReservation(+id, endMileage);
    }
    deleteReservation(id) {
        return this.appService.deleteReservation(+id);
    }
    async getCalendarIcs() {
        return this.appService.getCalendarIcs();
    }
};
__decorate([
    Get('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getUsers", null);
__decorate([
    Post('users'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createUser", null);
__decorate([
    Patch('users/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateUser", null);
__decorate([
    Delete('users/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteUser", null);
__decorate([
    Get('cars'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getCars", null);
__decorate([
    Post('cars'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createCar", null);
__decorate([
    Patch('cars/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateCar", null);
__decorate([
    Get('reservations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getReservations", null);
__decorate([
    Post('reservations'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "createReservation", null);
__decorate([
    Patch('reservations/:id'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateReservation", null);
__decorate([
    Patch('reservations/:id/status'),
    __param(0, Param('id')),
    __param(1, Body('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "updateStatus", null);
__decorate([
    Patch('reservations/:id/complete'),
    __param(0, Param('id')),
    __param(1, Body('endMileage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "complete", null);
__decorate([
    Delete('reservations/:id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "deleteReservation", null);
__decorate([
    Get('calendar/ics'),
    Header('Content-Type', 'text/calendar'),
    Header('Content-Disposition', 'attachment; filename="brumbrum.ics"'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getCalendarIcs", null);
AppController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [AppService])
], AppController);
export { AppController };
//# sourceMappingURL=app.controller.js.map