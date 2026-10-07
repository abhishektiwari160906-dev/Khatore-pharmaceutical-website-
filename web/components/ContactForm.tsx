'use client';

import { useState, type FormEvent } from 'react';
import { trackEvent } from '@/lib/events/client';
import styles from './ContactForm.module.css';

/**
 * A commercial enquiry form, not a patient intake / diagnosis form
 * (Section 22). Every submission goes through the same single event
 * layer as everything else — no parallel storage system for form data.
 */
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '');
    const email = String(form.get('email') ?? '');
    const phone = String(form.get('phone') ?? '');
    const country = String(form.get('country') ?? '');
    const productContext = String(form.get('productContext') ?? '');
    const message = String(form.get('message') ?? '');
    const consent = form.get('consent') === 'on';
    const website = String(form.get('website') ?? ''); // honeypot -- real visitors never see/fill this

    const params = new URLSearchParams(window.location.search);

    const [eventOk, leadRes] = await Promise.all([
      trackEvent(
        'contact_form_submitted',
        { metadata: { name, email, phone, country, productContext, message, source: 'contact_page' } },
        { confirmDelivery: true },
      ),
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          country,
          productInterest: productContext,
          message,
          consent,
          website,
          source: 'contact_page',
          utmSource: params.get('utm_source') ?? undefined,
          utmMedium: params.get('utm_medium') ?? undefined,
          utmCampaign: params.get('utm_campaign') ?? undefined,
        }),
      }).catch(() => null),
    ]);

    if (eventOk || leadRes?.ok) {
      setStatus('sent');
      e.currentTarget.reset();
    } else {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p className={styles.confirmation}>Thank you — Khatore will be in touch shortly.</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row2}>
        <label className={styles.field}>
          <span>Full name</span>
          <input className={styles.input} type="text" name="name" required autoComplete="name" />
        </label>
        <label className={styles.field}>
          <span>Email</span>
          <input className={styles.input} type="email" name="email" required autoComplete="email" />
        </label>
      </div>
      <div className={styles.row2}>
        <label className={styles.field}>
          <span>Phone (optional)</span>
          <input className={styles.input} type="tel" name="phone" autoComplete="tel" />
        </label>
        <label className={styles.field}>
          <span>Country</span>
          <input className={styles.input} type="text" name="country" />
        </label>
      </div>
      <label className={styles.field}>
        <span>Enquiry type / product</span>
        <input className={styles.input} type="text" name="productContext" placeholder="e.g. Kamalahar" />
      </label>
      <label className={styles.field}>
        <span>How can we assist?</span>
        <textarea className={styles.textarea} name="message" required />
      </label>
      {/* Honeypot: visually hidden from real visitors, off-screen rather than display:none so basic bots that skip hidden fields still fill it. Server rejects any submission with this field non-empty. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
      />
      <label className={styles.consentField}>
        <input type="checkbox" name="consent" required />
        <span>
          I agree to be contacted by Khatore Pharmaceuticals about this enquiry. Your information is kept
          strictly by Khatore Pharmaceuticals — it is never sold or shared with any third party or agency.
        </span>
      </label>
      <p className={styles.disclaimer}>
        This is a commercial enquiry form, not a medical consultation. For medical advice, consult a
        qualified healthcare practitioner.
      </p>
      <button type="submit" className={styles.submit}>
        Send Enquiry
      </button>
      {status === 'error' ? <p className={styles.error}>Something went wrong — please try again.</p> : null}
    </form>
  );
}
