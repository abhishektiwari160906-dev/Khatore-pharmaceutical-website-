'use client';

import { trackEvent } from '@/lib/events/client';

interface WhatsAppCtaProps {
  phone: string; // digits only, e.g. "918709206320"
  label: string;
  message?: string;
  productId?: string;
  productName?: string;
  className?: string;
}

/** Every WhatsApp entry point on the site should route through this component (Section 21) — never a bare <a> to wa.me/api.whatsapp.com. */
export function WhatsAppCta({
  phone,
  label,
  message = 'Hi',
  productId,
  productName,
  className,
}: WhatsAppCtaProps) {
  const href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={className}
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
