export interface IAuditLogger {
  log(message: string): void;
  error(message: string, trace?: string): void;
}

export const AUDIT_LOGGER_TOKEN = 'AUDIT_LOGGER';
