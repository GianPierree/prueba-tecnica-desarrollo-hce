/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Logger } from '@nestjs/common';

const logger = new Logger('AuditDecorator');

export function AuditLog(action: string) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    descriptor.value = async function (...args: unknown[]) {
      const start = Date.now();
      logger.log(`[INICIO] ${action} — método: ${propertyKey}`);

      try {
        const result = await originalMethod.apply(this, args);
        const elapsed = Date.now() - start;
        logger.log(`[FIN] ${action} completado en ${elapsed}ms`);
        return result;
      } catch (error: unknown) {
        const elapsed = Date.now() - start;
        const msg = error instanceof Error ? error.message : 'Error desconocido';
        logger.error(`[ERROR] ${action} falló en ${elapsed}ms — ${msg}`);
        throw error;
      }
    };

    return descriptor;
  };
}
