/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export function AuditLog(action: string) {
  return function (
    _target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value as (
      ...args: unknown[]
    ) => Promise<unknown>;

    descriptor.value = async function (...args: unknown[]) {
      const logger = (this as { auditLogger?: { log: (m: string) => void; error: (m: string) => void } })
        .auditLogger ?? {
          log: (m: string) => console.log(m),
          error: (m: string) => console.error(m),
        };

      const start = Date.now();
      logger.log(`[INICIO] ${action} — método: ${propertyKey}`);

      try {
        const result = await originalMethod.apply(this, args);
        logger.log(`[FIN] ${action} completado en ${Date.now() - start}ms`);
        return result;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error desconocido';
        logger.error(`[ERROR] ${action} falló en ${Date.now() - start}ms — ${msg}`);
        throw error;
      }
    };

    return descriptor;
  };
}
