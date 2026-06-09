import { Injectable, Logger } from '@nestjs/common';
import { IAuditLogger } from '../interfaces/audit-logger.interface';

@Injectable()
export class NestAuditLogger implements IAuditLogger {
  private readonly logger = new Logger('Audit');

  log(message: string): void {
    this.logger.log(message);
  }

  error(message: string, trace?: string): void {
    this.logger.error(message, trace);
  }
}
