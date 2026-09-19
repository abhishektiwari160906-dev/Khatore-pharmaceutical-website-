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
