import Image from 'next/image';
import { PRODUCTS } from '@/data/products';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div>
          <Image
            src="/assets/brand/khatore-logo.png"
            alt="Khatore Pharmaceuticals"
            width={110}
            height={38}
            className={styles.logo}
          />
          <p className={styles.brandText}>
            Dedicated in service of mankind. Efficacious, safe and economic Ayurvedic products. Est. 1984,
            Barbil, Orissa. GMP Certified.
          </p>
          <ul className={styles.social}>
            <li>
              <a href="https://www.facebook.com/liverhealthy/" target="_blank" rel="noopener">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://twitter.com/khatorepharma" target="_blank" rel="noopener">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/khatore-pharmaceuticals-p-ltd/about/" target="_blank" rel="noopener">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
        <div>
          <span className={styles.colTitle}>Products</span>
          <ul className={styles.links}>
            {PRODUCTS.map((p) => (
              <li key={p.productId}>
                <a href={p.checkoutUrl} target="_blank" rel="noopener">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className={styles.colTitle}>Company</span>
          <ul className={styles.links}>
            <li>
              <a href="https://www.khatorepharma.com/about-us" target="_blank" rel="noopener">
                About Us
              </a>
            </li>
            <li>
              <a href="https://www.khatorepharma.com/about-us#clinicalTrial" target="_blank" rel="noopener">
                Clinical Trials
              </a>
            </li>
            <li>
              <a href="https://www.khatorepharma.com/testimonials" target="_blank" rel="noopener">
                Testimonials
              </a>
            </li>
            <li>
              <a href="https://www.khatorepharma.com/wellness/kamalahar" target="_blank" rel="noopener">
                Wellness
              </a>
            </li>
            <li>
              <a href="https://www.khatorepharma.com/blog" target="_blank" rel="noopener">
                Blog &amp; Insights
              </a>
            </li>
            <li>
              <a href="https://www.khatorepharma.com/faq" target="_blank" rel="noopener">
                FAQ
              </a>
            </li>
          </ul>
        </div>
        <div>
          <span className={styles.colTitle}>Contact</span>
          <ul className={styles.links}>
            <li>
              <a href="mailto:support@khatorepharma.com">Email Khatore</a>
            </li>
            <li>
              <a href="https://api.whatsapp.com/send?phone=919665110525&text=Hi" target="_blank" rel="noopener">
                WhatsApp US/UK/EU
              </a>
            </li>
            <li>
              <a href="https://api.whatsapp.com/send?phone=918709206320&text=Hi" target="_blank" rel="noopener">
                WhatsApp India/World
              </a>
            </li>
            <li>
              <a
                href="https://www.amazon.in/stores/Khatore+Pharmaceutical/page/2067E8F4-5E4D-49A3-B405-20BCA2B42D0C"
                target="_blank"
                rel="noopener"
              >
                Amazon India
              </a>
            </li>
            <li>
              <a href="https://www.khatorepharma.com/contactus" target="_blank" rel="noopener">
                Contact Form
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>© Khatore Pharmaceuticals Pvt. Ltd. · P.O. Barbil, Dt. Keonjhar, Orissa, India – 758035</p>
      </div>

      <p className={styles.disclaimer}>
        [LEGAL DISCLAIMER — TO BE PROVIDED AND APPROVED BY KHATORE PHARMACEUTICALS] · Information presented is
        for educational purposes only and does not constitute medical advice, diagnosis or treatment.
        Individual results may vary. Consult a qualified healthcare practitioner. Khatore Pharmaceuticals Pvt.
        Ltd. complies with the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 and all
        applicable Indian pharmaceutical advertising regulations. Clinical trial summaries are drawn from
        published company-provided documentation and are not guarantees of individual therapeutic outcomes.
        Prices shown are current at time of source retrieval and subject to change.
      </p>
    </footer>
  );
}
