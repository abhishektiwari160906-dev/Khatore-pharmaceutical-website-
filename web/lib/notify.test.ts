import { describe, it, expect, vi } from 'vitest';
import { sendWithRetry, type Notifier } from './notify';

function fakeNotifier(failTimes: number): Notifier {
  let calls = 0;
  return {
    async send() {
      calls++;
      if (calls <= failTimes) return { ok: false, error: `simulated failure ${calls}` };
      return { ok: true };
    },
  };
}

describe('sendWithRetry', () => {
  it('succeeds on the first attempt when the notifier works', async () => {
    const notifier = fakeNotifier(0);
    const result = await sendWithRetry(notifier, { subject: 's', body: 'b' }, { delayMs: () => 0 });
    expect(result).toEqual({ ok: true, attempts: 1 });
  });

  it('retries and succeeds after transient failures', async () => {
    const notifier = fakeNotifier(2);
    const result = await sendWithRetry(notifier, { subject: 's', body: 'b' }, { maxAttempts: 3, delayMs: () => 0 });
    expect(result).toEqual({ ok: true, attempts: 3 });
  });

  it('gives up after maxAttempts and reports the last error', async () => {
    const notifier = fakeNotifier(99);
    const result = await sendWithRetry(notifier, { subject: 's', body: 'b' }, { maxAttempts: 3, delayMs: () => 0 });
    expect(result.ok).toBe(false);
    expect(result.attempts).toBe(3);
    expect(result.error ?? '').toContain('simulated failure 3');
  });

  it('flags an exhausted-retry record with a loud console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const notifier = fakeNotifier(99);
    await sendWithRetry(notifier, { subject: 's', body: 'b' }, { maxAttempts: 2, delayMs: () => 0 });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toContain('khatore_notification_failed');
    spy.mockRestore();
  });
});
