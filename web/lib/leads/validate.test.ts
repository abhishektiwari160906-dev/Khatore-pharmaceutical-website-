import { describe, it, expect } from 'vitest';
import { validateLead } from './validate';

const VALID = {
  name: 'Test User',
  email: 'test@example.com',
  message: 'Interested in Kamalahar',
  consent: true,
  source: 'contact_page',
};

describe('validateLead', () => {
  it('accepts a well-formed submission', () => {
    const result = validateLead(VALID);
    expect(result.ok).toBe(true);
  });

  it('rejects a filled honeypot field as if it were any other invalid submission', () => {
    const result = validateLead({ ...VALID, website: 'http://spam.example.com' });
    expect(result.ok).toBe(false);
  });

  it('rejects a missing name', () => {
    const result = validateLead({ ...VALID, name: undefined });
    expect(result.ok).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = validateLead({ ...VALID, email: 'not-an-email' });
    expect(result.ok).toBe(false);
  });

  it('rejects a missing message', () => {
    const result = validateLead({ ...VALID, message: '   ' });
    expect(result.ok).toBe(false);
  });

  it('rejects when consent is not explicitly true', () => {
    const result = validateLead({ ...VALID, consent: false });
    expect(result.ok).toBe(false);
  });

  it('carries optional UTM/product fields through when present', () => {
    const result = validateLead({ ...VALID, utmSource: 'google', productInterest: 'Kamalahar', country: 'IN' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.utmSource).toBe('google');
      expect(result.value.productInterest).toBe('Kamalahar');
      expect(result.value.country).toBe('IN');
    }
  });
});
