/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
import { AuditLog } from './audit-log.decorator';

describe('AuditLog decorator', () => {
  const mockLogger = { log: jest.fn(), error: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it('should call auditLogger.log on start and finish', async () => {
    class TestService {
      auditLogger = mockLogger;

      @AuditLog('Test action')
      async doWork() {
        return 'result';
      }
    }

    const svc = new TestService();
    const result = await svc.doWork();

    expect(result).toBe('result');
    expect(mockLogger.log).toHaveBeenCalledTimes(2);
    expect(mockLogger.log.mock.calls[0][0]).toContain('[INICIO] Test action');
    expect(mockLogger.log.mock.calls[1][0]).toContain('[FIN] Test action');
  });

  it('should call auditLogger.error and rethrow on failure', async () => {
    class FailService {
      auditLogger = mockLogger;

      @AuditLog('Failing action')
      async failWork() {
        throw new Error('something went wrong');
      }
    }

    const svc = new FailService();
    await expect(svc.failWork()).rejects.toThrow('something went wrong');
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    expect(mockLogger.error.mock.calls[0][0]).toContain('[ERROR] Failing action');
    expect(mockLogger.error.mock.calls[0][0]).toContain('something went wrong');
  });

  it('should use console.log as fallback when no auditLogger injected', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    class NoLoggerService {
      @AuditLog('No logger action')
      async run() {
        return 42;
      }
    }

    const svc = new NoLoggerService();
    await svc.run();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
