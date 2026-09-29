import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { OrderConfirmationClient } from '@/components/OrderConfirmation/OrderConfirmationClient';

// Section 24: never indexable, and must never expose customer/order data via metadata.
export const metadata: Metadata = {
  title: 'Order Confirmation',
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return (
    <>
      <Nav />
      <main>
        <OrderConfirmationClient />
      </main>
      <Footer />
    </>
  );
}
