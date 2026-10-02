import { Repository } from 'typeorm';
import { User, Car, Reservation, ReservationStatus } from './entities/entities.js';
import { AppGateway } from './gateways/app.gateway.js';
import { NotificationService } from './notifications/notification.service.js';
export declare class AppService {
    private userRepository;
    private carRepository;
    private reservationRepository;
    private appGateway;
    private notificationService;
    constructor(userRepository: Repository<User>, carRepository: Repository<Car>, reservationRepository: Repository<Reservation>, appGateway: AppGateway, notificationService: NotificationService);
    getUsers(): Promise<User[]>;
    createUser(data: Partial<User>): Promise<User>;
    updateUser(id: number, data: Partial<User>): Promise<User | null>;
    deleteUser(id: number): Promise<import("typeorm").DeleteResult>;
    getCars(): Promise<Car[]>;
    createCar(data: any): Promise<Car[]>;
    updateCar(id: number, data: any): Promise<Car>;
    getReservations(): Promise<Reservation[]>;
    createReservation(data: any): Promise<Reservation>;
    updateReservation(id: number, data: any): Promise<Reservation | null>;
    updateReservationStatus(id: number, status: ReservationStatus): Promise<Reservation | null>;
    completeReservation(id: number, endMileage: number): Promise<Reservation>;
    deleteReservation(id: number): Promise<import("typeorm").DeleteResult>;
    getCalendarIcs(): Promise<string>;
}
