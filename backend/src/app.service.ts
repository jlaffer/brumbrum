import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User, Car, Reservation, ReservationStatus } from './entities/entities.js';
import { AppGateway } from './gateways/app.gateway.js';
import { NotificationService } from './notifications/notification.service.js';
import * as ics from 'ics';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private appGateway: AppGateway,
    private notificationService: NotificationService,
  ) {}

  async getUsers() {
    return this.userRepository.find();
  }

  async createUser(data: Partial<User>) {
    const user = this.userRepository.create(data);
    const saved = await this.userRepository.save(user);
    this.appGateway.notifyUserUpdate();
    return saved;
  }

  async updateUser(id: number, data: Partial<User>) {
    await this.userRepository.update(id, data);
    this.appGateway.notifyUserUpdate();
    return this.userRepository.findOneBy({ id });
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete(id);
    this.appGateway.notifyUserUpdate();
    return result;
  }

  async getCars() {
    return this.carRepository.find({ relations: { owner: true } });
  }

  async createCar(data: any) {
    const owner = await this.userRepository.findOneBy({ id: data.ownerId });
    if (!owner) throw new Error('Owner not found');
    const car = this.carRepository.create({ ...data, owner });
    const saved = await this.carRepository.save(car);
    this.appGateway.notifyCarUpdate();
    return saved;
  }

  async getReservations() {
    return this.reservationRepository.find({ 
      relations: { 
        user: true, 
        car: { owner: true } 
      } 
    });
  }

  async createReservation(data: any) {
    const user = await this.userRepository.findOneBy({ id: data.userId });
    const car = await this.carRepository.findOne({
      where: { id: data.carId },
      relations: { owner: true }
    });
    if (!user || !car) throw new Error('User or Car not found');
    
    const reservation = this.reservationRepository.create({
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      user,
      car,
    });
    const saved = await this.reservationRepository.save(reservation);
    this.appGateway.notifyReservationUpdate();

    const fullReservation = await this.reservationRepository.findOne({
      where: { id: saved.id },
      relations: { user: true, car: { owner: true } }
    });

    if (fullReservation) {
      this.notificationService.notifyNewReservation(fullReservation);
    }
    
    return saved;
  }

  async updateReservation(id: number, data: any) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: { user: true, car: true }
    });
    if (!reservation) throw new Error('Reservation not found');

    if (data.startTime) reservation.startTime = new Date(data.startTime);
    if (data.endTime) reservation.endTime = new Date(data.endTime);
    if (data.carId) {
      const car = await this.carRepository.findOneBy({ id: data.carId });
      if (car) reservation.car = car;
    }

    // Reset status to PENDING on update as requested
    reservation.status = ReservationStatus.PENDING;

    const saved = await this.reservationRepository.save(reservation);
    this.appGateway.notifyReservationUpdate();

    const fullReservation = await this.reservationRepository.findOne({
      where: { id: saved.id },
      relations: { 
        user: true, 
        car: { owner: true } 
      }
    });

    if (fullReservation) {
      this.notificationService.notifyReservationChanged(fullReservation);
    }

    return fullReservation;
  }

  async updateReservationStatus(id: number, status: ReservationStatus) {
    await this.reservationRepository.update(id, { status });
    this.appGateway.notifyReservationUpdate();
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: { 
        user: true, 
        car: { owner: true } 
      }
    });

    if (reservation && status === ReservationStatus.APPROVED) {
      this.notificationService.notifyReservationApproved(reservation);
    }

    return reservation;
  }

  async completeReservation(id: number, endMileage: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: { 
        user: true, 
        car: { owner: true } 
      },
    });
    if (!reservation) throw new Error('Reservation not found');
    
    reservation.status = ReservationStatus.COMPLETED;
    reservation.endMileage = endMileage;
    await this.reservationRepository.save(reservation);

    if (reservation.car) {
      reservation.car.currentMileage = endMileage;
      await this.carRepository.save(reservation.car);
      this.appGateway.notifyCarUpdate();
    }
    
    this.appGateway.notifyReservationUpdate();
    return reservation;
  }

  async deleteReservation(id: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: { user: true, car: { owner: true } }
    });
    
    const result = await this.reservationRepository.delete(id);
    this.appGateway.notifyReservationUpdate();
    
    if (reservation) {
      this.notificationService.notifyReservationDeleted(reservation);
    }
    
    return result;
  }

  async getCalendarIcs(): Promise<string> {
    const reservations = await this.reservationRepository.find({
      relations: { user: true, car: true },
      where: { status: Not(ReservationStatus.REJECTED) }
    });

    const events: ics.EventAttributes[] = reservations.map(res => {
      const start = new Date(res.startTime);
      const end = new Date(res.endTime);
      
      const startArray: ics.DateArray = [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes()
      ];
      
      const endArray: ics.DateArray = [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes()
      ];

      return {
        start: startArray,
        end: endArray,
        title: `BrumBrum: ${res.car.brand} ${res.car.model} (${res.user.name})`,
        description: `Reservierung für ${res.car.brand} ${res.car.model} von ${res.user.name}. Status: ${res.status}`,
        location: res.car.licensePlate,
        status: res.status === ReservationStatus.APPROVED ? 'CONFIRMED' : 'TENTATIVE',
        busyStatus: 'BUSY'
      };
    });

    if (events.length === 0) {
      // Create a dummy event if no reservations, otherwise ics fails
      return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//BrumBrum//NONSGML v1.0//EN\r\nEND:VCALENDAR';
    }

    return new Promise((resolve, reject) => {
      ics.createEvents(events, (error, value) => {
        if (error) {
          return reject(error);
        }
        resolve(value);
      });
    });
  }
}
