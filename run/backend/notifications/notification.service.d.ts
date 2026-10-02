import { Reservation } from '../entities/entities.js';
export declare class NotificationService {
    private readonly logger;
    private transporter;
    constructor();
    notifyNewReservation(reservation: Reservation): Promise<void>;
    notifyReservationChanged(reservation: Reservation): Promise<void>;
    notifyReservationDeleted(reservation: Reservation): Promise<void>;
    notifyReservationApproved(reservation: Reservation): Promise<void>;
    private sendEmail;
    private sendWhatsApp;
}
