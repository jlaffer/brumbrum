import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';

export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;
 
  @Column({ nullable: true })
  whatsappApiKey: string;
 
  @Column({ default: '#1890ff' })
  color: string;

  @OneToMany(() => Car, (car) => car.owner)
  cars: Car[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}

@Entity()
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  licensePlate: string;

  @Column('float', { default: 0 })
  currentMileage: number;

  @ManyToOne(() => User, (user) => user.cars)
  owner: User;

  @OneToMany(() => Reservation, (reservation) => reservation.car)
  reservations: Reservation[];
}

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({
    type: 'simple-enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column('float', { nullable: true })
  endMileage: number;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @ManyToOne(() => Car, (car) => car.reservations)
  car: Car;
}
