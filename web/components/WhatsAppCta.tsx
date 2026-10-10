'use client';

import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/events/client';

interface WhatsAppCtaProps {
  phone: string; // digits only, e.g. "918709206320"
  label: ReactNode;
  message?: string;
  productId?: string;
  productName?: string;
  className?: string;
  'aria-label'?: string;
  /**
   * Plain wa.me/<phone> with no prefilled text, instead of the default
   * api.whatsapp.com/send?text=... form -- for the sitewide header icon
   * (10 Oct: "use a standard wa.me/918709206320 link so it works on
   * both mobile and desktop"). Every other call site keeps the default
   * form unchanged.
   */
  bare?: boolean;
}

/** Every WhatsApp entry point on the site should route through this component (Section 21) — never a bare <a> to wa.me/api.whatsapp.com. */
export function WhatsAppCta({
  phone,
  label,
  message = 'Hi',
  productId,
  productName,
  className,
  bare = false,
  ...rest
}: WhatsAppCtaProps) {
  const href = bare
    ? `https://wa.me/${phone}`
    : `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={className}
      aria-label={rest['aria-label']}
      onClick={() => {
        trackEvent('whatsapp_click', {
          product_id: productId,
          product_name: productName,
          metadata: { phone },
        });
      }}
    >
      {label}
    </a>
  );
}
