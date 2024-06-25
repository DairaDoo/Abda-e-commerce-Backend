// Importing NodeMailer
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

// Defining the MailService class
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Creating the transporter with configuration for Gmail
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.GOOGLE_MAIL_APP_EMAIL,
        pass: process.env.GOOGLE_MAIL_APP_PASSWORD,
      },
    });
  }

  // Method to send emails
  async send(to: string, subject: string, message: string): Promise<boolean> {
    const mailOptions = {
      from: process.env.GOOGLE_MAIL_APP_EMAIL,
      to: to,
      subject: subject,
      html: message,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email: ', error);
      return false;
    }
  }
}
