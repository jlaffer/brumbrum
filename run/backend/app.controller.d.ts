import { AppService } from './app.service.js';
import { ReservationStatus } from './entities/entities.js';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getUsers(): Promise<import("./entities/entities.js").User[]>;
    createUser(data: any): Promise<import("./entities/entities.js").User>;
    updateUser(id: string, data: any): Promise<import("./entities/entities.js").User | null>;
    deleteUser(id: string): Promise<import("typeorm").DeleteResult>;
    getCars(): Promise<import("./entities/entities.js").Car[]>;
    createCar(data: any): Promise<import("./entities/entities.js").Car[]>;
    updateCar(id: string, data: any): Promise<import("./entities/entities.js").Car>;
    getReservations(): Promise<import("./entities/entities.js").Reservation[]>;
    createReservation(data: any): Promise<import("./entities/entities.js").Reservation>;
    updateReservation(id: string, data: any): Promise<import("./entities/entities.js").Reservation | null>;
    updateStatus(id: string, status: ReservationStatus): Promise<import("./entities/entities.js").Reservation | null>;
    complete(id: string, endMileage: number): Promise<import("./entities/entities.js").Reservation>;
    deleteReservation(id: string): Promise<import("typeorm").DeleteResult>;
    getCalendarIcs(): Promise<string>;
}
