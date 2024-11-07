import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private logger = new Logger(NotificationsService.name);

  async sendWelcomeEmail(payload: any) {
    this.logger.debug(
      `Sending Welcome Email: ${JSON.stringify(payload, null, 2)}`,
    );
  }

  async sendPasswordResetLinkEmail(payload: any) {
    this.logger.debug(
      `Sending Password Reset Email: ${JSON.stringify(payload, null, 2)}`,
    );
  }

  async sendHasBeenResetEmail(payload: any) {
    this.logger.debug(
      `Sending Password Has Been Reset Email: ${JSON.stringify(payload, null, 2)}`,
    );
  }
}
