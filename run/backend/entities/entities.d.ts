export declare enum ReservationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    COMPLETED = "COMPLETED"
}
export declare class User {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    whatsappApiKey: string;
    color: string;
    cars: Car[];
    reservations: Reservation[];
}
export declare class Car {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
    currentMileage: number;
    isActive: boolean;
    owner: User;
    reservations: Reservation[];
}
export declare class Reservation {
    id: number;
    startTime: Date;
    endTime: Date;
    status: ReservationStatus;
    endMileage: number;
    user: User;
    car: Car;
}
