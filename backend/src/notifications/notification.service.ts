import { Injectable, Logger } from '@nestjs/common';
import { User, Reservation } from '../entities/entities.js';
import * as nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.auth.user,
        pass: mailConfig.auth.pass,
      },
    });
  }

  async notifyNewReservation(reservation: Reservation) {
    const owner = reservation.car.owner;
    const user = reservation.user;
    const car = reservation.car;

    const message = `Hallo ${owner.name}, es gibt eine neue Reservierungsanfrage für deinen ${car.brand} ${car.model} von ${user.name} für den Zeitraum ${reservation.startTime.toLocaleString()} bis ${reservation.endTime.toLocaleString()}.`;

    this.sendEmail(owner.email, 'Neue Reservierungsanfrage', message);
    if (owner.phoneNumber && owner.whatsappApiKey) {
      this.sendWhatsApp(owner.phoneNumber, message, owner.whatsappApiKey);
    }
  }

  async notifyReservationChanged(reservation: Reservation) {
    const owner = reservation.car.owner;
    const user = reservation.user;
    const car = reservation.car;

    const message = `Hallo ${owner.name}, die Reservierung für deinen ${car.brand} ${car.model} von ${user.name} wurde geändert. Neuer Zeitraum: ${reservation.startTime.toLocaleString()} bis ${reservation.endTime.toLocaleString()}. Bitte erneut bestätigen.`;

    this.sendEmail(owner.email, 'Reservierung geändert', message);
    if (owner.phoneNumber && owner.whatsappApiKey) {
      this.sendWhatsApp(owner.phoneNumber, message, owner.whatsappApiKey);
    }
  }

  async notifyReservationDeleted(reservation: Reservation) {
    const owner = reservation.car.owner;
    const user = reservation.user;
    const car = reservation.car;

    const message = `Hallo ${owner.name}, die Reservierung für deinen ${car.brand} ${car.model} von ${user.name} (${reservation.startTime.toLocaleString()}) wurde storniert.`;

    this.sendEmail(owner.email, 'Reservierung storniert', message);
    if (owner.phoneNumber && owner.whatsappApiKey) {
      this.sendWhatsApp(owner.phoneNumber, message, owner.whatsappApiKey);
    }
  }

  async notifyReservationApproved(reservation: Reservation) {
    const user = reservation.user;
    const car = reservation.car;

    const message = `Hallo ${user.name}, deine Reservierung für den ${car.brand} ${car.model} von ${reservation.startTime.toLocaleString()} wurde von ${car.owner.name} bestätigt! Viel Spaß bei der Fahrt.`;

    this.sendEmail(user.email, 'Reservierung bestätigt', message);
    if (user.phoneNumber && user.whatsappApiKey) {
      this.sendWhatsApp(user.phoneNumber, message, user.whatsappApiKey);
    }
  }

  private async sendEmail(to: string, subject: string, body: string) {
    try {
      this.logger.log(`Versende E-Mail an ${to} mit Betreff: ${subject}...`);
      await this.transporter.sendMail({
        from: mailConfig.from,
        to,
        subject,
        text: body,
      });
      this.logger.log(`E-Mail erfolgreich an ${to} versendet.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Fehler beim Versenden der E-Mail an ${to}: ${errorMessage}`);
    }
  }

  private async sendWhatsApp(to: string, body: string, apikey: string) {
    try {
      const phone = to.replace(/\+/g, '').replace(/\s/g, '');
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(body)}&apikey=${apikey}`;
      
      this.logger.log(`Versende WhatsApp an ${to} via CallMeBot...`);
      
      const response = await fetch(url);
      if (response.ok) {
        this.logger.log(`WhatsApp erfolgreich an ${to} versendet.`);
      } else {
        const errorText = await response.text();
        this.logger.error(`Fehler beim Versenden der WhatsApp an ${to}: ${errorText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Exception beim Versenden der WhatsApp an ${to}: ${errorMessage}`);
    }
  }
}
