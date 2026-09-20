import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import styles from './page.module.css';

const description = 'Enquire with Khatore Pharmaceuticals.';

export const metadata: Metadata = {
  title: 'Contact',
  description,
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact — Khatore Pharmaceuticals', description, url: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Begin your <strong>enquiry.</strong>
          </h1>
          <p className={styles.body}>
            Reach Khatore directly — by form, WhatsApp, or email. For urgent queries, WhatsApp is fastest.
          </p>
          <span className={styles.waLabel}>Chat with Khatore</span>
          <div className={styles.whatsappRow}>
            <WhatsAppCta phone="919665110525" label="WhatsApp — US/UK/EU" className={styles.waBtn} />
            <WhatsAppCta phone="918709206320" label="WhatsApp — India/World" className={styles.waBtn} />
          </div>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
