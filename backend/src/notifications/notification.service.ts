import { Injectable, Logger } from '@nestjs/common';
import { User, Reservation } from '../entities/entities.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async notifyNewReservation(reservation: Reservation) {
    const owner = reservation.car.owner;
    const user = reservation.user;
    const car = reservation.car;

    const message = `Hallo ${owner.name}, es gibt eine neue Reservierungsanfrage für deinen ${car.brand} ${car.model} von ${user.name} für den Zeitraum ${reservation.startTime.toLocaleString()} bis ${reservation.endTime.toLocaleString()}.`;

    this.sendEmail(owner.email, 'Neue Reservierungsanfrage', message);
    if (owner.phoneNumber) {
      this.sendWhatsApp(owner.phoneNumber, message);
    }
  }

  async notifyReservationChanged(reservation: Reservation) {
    const owner = reservation.car.owner;
    const user = reservation.user;
    const car = reservation.car;

    const message = `Hallo ${owner.name}, die Reservierung für deinen ${car.brand} ${car.model} von ${user.name} wurde geändert. Neuer Zeitraum: ${reservation.startTime.toLocaleString()} bis ${reservation.endTime.toLocaleString()}. Bitte erneut bestätigen.`;

    this.sendEmail(owner.email, 'Reservierung geändert', message);
    if (owner.phoneNumber) {
      this.sendWhatsApp(owner.phoneNumber, message);
    }
  }

  async notifyReservationDeleted(reservation: Reservation) {
    const owner = reservation.car.owner;
    const user = reservation.user;
    const car = reservation.car;

    const message = `Hallo ${owner.name}, die Reservierung für deinen ${car.brand} ${car.model} von ${user.name} (${reservation.startTime.toLocaleString()}) wurde storniert.`;

    this.sendEmail(owner.email, 'Reservierung storniert', message);
    if (owner.phoneNumber) {
      this.sendWhatsApp(owner.phoneNumber, message);
    }
  }

  async notifyReservationApproved(reservation: Reservation) {
    const user = reservation.user;
    const car = reservation.car;

    const message = `Hallo ${user.name}, deine Reservierung für den ${car.brand} ${car.model} von ${reservation.startTime.toLocaleString()} wurde von ${car.owner.name} bestätigt! Viel Spaß bei der Fahrt.`;

    this.sendEmail(user.email, 'Reservierung bestätigt', message);
    if (user.phoneNumber) {
      this.sendWhatsApp(user.phoneNumber, message);
    }
  }

  private sendEmail(to: string, subject: string, body: string) {
    // MOCK: In einer echten Umgebung würde hier Nodemailer o.ä. verwendet werden
    this.logger.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject} | Body: ${body}`);
  }

  private sendWhatsApp(to: string, body: string) {
    // MOCK: In einer echten Umgebung würde hier eine API wie Twilio verwendet werden
    this.logger.log(`[WHATSAPP MOCK] To: ${to} | Body: ${body}`);
  }
}
