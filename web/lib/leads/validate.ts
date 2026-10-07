/**
 * Pure, server-side validation + spam check -- no I/O, fully
 * unit-testable. The API route (app/api/leads/route.ts) is the only
 * caller, but nothing here depends on Next.js or the request object,
 * so it's testable in isolation.
 */

export interface LeadSubmission {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  country?: unknown;
  productInterest?: unknown;
  message?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  source?: unknown;
  consent?: unknown;
  /** Honeypot field -- a real browser never fills this in (it's visually hidden); a naive bot filling every field will. */
  website?: unknown;
}

export type ValidationResult =
  | { ok: true; value: { name: string; email: string; phone?: string; country?: string; productInterest?: string; message: string; utmSource?: string; utmMedium?: string; utmCampaign?: string; source: string; consent: true } }
  | { ok: false; error: string };

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(body: LeadSubmission): ValidationResult {
  // Honeypot: a filled-in hidden field is a near-certain bot signal.
  // Reject quietly (same error shape as a real validation failure) --
  // never tell an automated client which check it tripped.
  if (str(body.website)) {
    return { ok: false, error: 'invalid submission' };
  }

  const name = str(body.name);
  if (!name) return { ok: false, error: 'name is required' };

  const email = str(body.email);
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: 'a valid email is required' };

  const message = str(body.message);
  if (!message) return { ok: false, error: 'message is required' };

  if (body.consent !== true) return { ok: false, error: 'consent is required' };

  const source = str(body.source) ?? 'unknown';

  return {
    ok: true,
    value: {
      name,
      email,
      phone: str(body.phone),
      country: str(body.country),
      productInterest: str(body.productInterest),
      message,
      utmSource: str(body.utmSource),
      utmMedium: str(body.utmMedium),
      utmCampaign: str(body.utmCampaign),
      source,
      consent: true,
    },
  };
}
