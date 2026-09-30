export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  whatsappApiKey?: string;
  color: string;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  licensePlate: string;
  currentMileage: number;
  owner: User;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export interface Reservation {
  id: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  endMileage?: number;
  user: User;
  car: Car;
}
