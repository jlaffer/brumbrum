var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
export var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "PENDING";
    ReservationStatus["APPROVED"] = "APPROVED";
    ReservationStatus["REJECTED"] = "REJECTED";
    ReservationStatus["COMPLETED"] = "COMPLETED";
})(ReservationStatus || (ReservationStatus = {}));
let User = class User {
    id;
    name;
    email;
    phoneNumber;
    whatsappApiKey;
    color;
    cars;
    reservations;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    Column({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "whatsappApiKey", void 0);
__decorate([
    Column({ default: '#1890ff' }),
    __metadata("design:type", String)
], User.prototype, "color", void 0);
__decorate([
    OneToMany(() => Car, (car) => car.owner),
    __metadata("design:type", Array)
], User.prototype, "cars", void 0);
__decorate([
    OneToMany(() => Reservation, (reservation) => reservation.user),
    __metadata("design:type", Array)
], User.prototype, "reservations", void 0);
User = __decorate([
    Entity()
], User);
export { User };
let Car = class Car {
    id;
    brand;
    model;
    licensePlate;
    currentMileage;
    isActive;
    owner;
    reservations;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Car.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Car.prototype, "brand", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Car.prototype, "model", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Car.prototype, "licensePlate", void 0);
__decorate([
    Column('float', { default: 0 }),
    __metadata("design:type", Number)
], Car.prototype, "currentMileage", void 0);
__decorate([
    Column({ default: true }),
    __metadata("design:type", Boolean)
], Car.prototype, "isActive", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.cars),
    __metadata("design:type", User)
], Car.prototype, "owner", void 0);
__decorate([
    OneToMany(() => Reservation, (reservation) => reservation.car),
    __metadata("design:type", Array)
], Car.prototype, "reservations", void 0);
Car = __decorate([
    Entity()
], Car);
export { Car };
let Reservation = class Reservation {
    id;
    startTime;
    endTime;
    status;
    endMileage;
    user;
    car;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Reservation.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Reservation.prototype, "startTime", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Reservation.prototype, "endTime", void 0);
__decorate([
    Column({
        type: 'simple-enum',
        enum: ReservationStatus,
        default: ReservationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Reservation.prototype, "status", void 0);
__decorate([
    Column('float', { nullable: true }),
    __metadata("design:type", Number)
], Reservation.prototype, "endMileage", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.reservations),
    __metadata("design:type", User)
], Reservation.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Car, (car) => car.reservations),
    __metadata("design:type", Car)
], Reservation.prototype, "car", void 0);
Reservation = __decorate([
    Entity()
], Reservation);
export { Reservation };
//# sourceMappingURL=entities.js.map