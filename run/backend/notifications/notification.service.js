var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';
let NotificationService = NotificationService_1 = class NotificationService {
    logger = new Logger(NotificationService_1.name);
    transporter;
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
    async notifyNewReservation(reservation) {
        const owner = reservation.car.owner;
        const user = reservation.user;
        const car = reservation.car;
        const message = `Hallo ${owner.name}, es gibt eine neue Reservierungsanfrage für deinen ${car.brand} ${car.model} von ${user.name} für den Zeitraum ${reservation.startTime.toLocaleString()} bis ${reservation.endTime.toLocaleString()}.`;
        this.sendEmail(owner.email, 'Neue Reservierungsanfrage', message);
        if (owner.phoneNumber && owner.whatsappApiKey) {
            this.sendWhatsApp(owner.phoneNumber, message, owner.whatsappApiKey);
        }
    }
    async notifyReservationChanged(reservation) {
        const owner = reservation.car.owner;
        const user = reservation.user;
        const car = reservation.car;
        const message = `Hallo ${owner.name}, die Reservierung für deinen ${car.brand} ${car.model} von ${user.name} wurde geändert. Neuer Zeitraum: ${reservation.startTime.toLocaleString()} bis ${reservation.endTime.toLocaleString()}. Bitte erneut bestätigen.`;
        this.sendEmail(owner.email, 'Reservierung geändert', message);
        if (owner.phoneNumber && owner.whatsappApiKey) {
            this.sendWhatsApp(owner.phoneNumber, message, owner.whatsappApiKey);
        }
    }
    async notifyReservationDeleted(reservation) {
        const owner = reservation.car.owner;
        const user = reservation.user;
        const car = reservation.car;
        const message = `Hallo ${owner.name}, die Reservierung für deinen ${car.brand} ${car.model} von ${user.name} (${reservation.startTime.toLocaleString()}) wurde storniert.`;
        this.sendEmail(owner.email, 'Reservierung storniert', message);
        if (owner.phoneNumber && owner.whatsappApiKey) {
            this.sendWhatsApp(owner.phoneNumber, message, owner.whatsappApiKey);
        }
    }
    async notifyReservationApproved(reservation) {
        const user = reservation.user;
        const car = reservation.car;
        const message = `Hallo ${user.name}, deine Reservierung für den ${car.brand} ${car.model} von ${reservation.startTime.toLocaleString()} wurde von ${car.owner.name} bestätigt! Viel Spaß bei der Fahrt.`;
        this.sendEmail(user.email, 'Reservierung bestätigt', message);
        if (user.phoneNumber && user.whatsappApiKey) {
            this.sendWhatsApp(user.phoneNumber, message, user.whatsappApiKey);
        }
    }
    async sendEmail(to, subject, body) {
        try {
            this.logger.log(`Versende E-Mail an ${to} mit Betreff: ${subject}...`);
            await this.transporter.sendMail({
                from: mailConfig.from,
                to,
                subject,
                text: body,
            });
            this.logger.log(`E-Mail erfolgreich an ${to} versendet.`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Fehler beim Versenden der E-Mail an ${to}: ${errorMessage}`);
        }
    }
    async sendWhatsApp(to, body, apikey) {
        try {
            const phone = to.replace(/\+/g, '').replace(/\s/g, '');
            const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(body)}&apikey=${apikey}`;
            this.logger.log(`Versende WhatsApp an ${to} via CallMeBot...`);
            const response = await fetch(url);
            if (response.ok) {
                this.logger.log(`WhatsApp erfolgreich an ${to} versendet.`);
            }
            else {
                const errorText = await response.text();
                this.logger.error(`Fehler beim Versenden der WhatsApp an ${to}: ${errorText}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Exception beim Versenden der WhatsApp an ${to}: ${errorMessage}`);
        }
    }
};
NotificationService = NotificationService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], NotificationService);
export { NotificationService };
//# sourceMappingURL=notification.service.js.map