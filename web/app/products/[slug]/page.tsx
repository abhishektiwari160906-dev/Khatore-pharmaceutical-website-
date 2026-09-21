import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { BuyButton } from '@/components/BuyButton';
import { AddToCartButton } from '@/components/Cart/AddToCartButton';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { TrackProductView } from '@/components/TrackProductView';
import { PRODUCTS, getProductBySlug } from '@/data/products';
import { CONTACT } from '@/lib/config';
import styles from './page.module.css';

const SITE_URL = 'https://www.khatorepharma.com';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  const description = product.description ?? `${product.name} — Khatore Pharmaceuticals.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} — Khatore Pharmaceuticals`,
      description,
      url: `/products/${product.slug}`,
      images: [{ url: product.image }],
    },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = PRODUCTS.filter((p) => p.productId !== product.productId).slice(0, 4);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: `${SITE_URL}${product.image}`,
    description: product.description ?? `${product.name} — Khatore Pharmaceuticals.`,
    brand: { '@type': 'Brand', name: 'Khatore Pharmaceuticals' },
  };

  return (
    <>
      <Nav />
      <TrackProductView productId={product.productId} productName={product.name} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <main className={styles.main}>
        <div className={styles.imageCol}>
          <Image src={product.image} alt={product.name} width={380} height={380} priority />
        </div>
        <div className={styles.detailCol}>
          <span className={styles.num}>
            {product.bgNum} of {String(PRODUCTS.length).padStart(2, '0')}
            {product.productId === 'kamalahar' ? ' — FLAGSHIP' : ''}
          </span>
          <h1 className={styles.name}>{product.name}</h1>
          <span className={styles.format}>{product.format}</span>
          <hr className={styles.rule} />
          {product.status === 'approved' && product.description ? (
            <p className={styles.desc}>{product.description}</p>
          ) : (
            <div className={styles.descPending}>
              <span className={styles.descPendingChip}>Awaiting Khatore approval</span>
              <p>A full description for {product.name} will be added once confirmed.</p>
            </div>
          )}
          {product.price ? (
            <div className={styles.priceArea}>
              <span className={styles.price}>${product.price.amount}</span>
              {product.priceNote ? <span className={styles.priceNote}>{product.priceNote}</span> : null}
            </div>
          ) : null}
          <div className={styles.actions}>
            <BuyButton product={product} className={styles.buy} />
            <AddToCartButton product={product} />
            <WhatsAppCta
              phone={CONTACT.whatsappIndiaWorld}
              label="Ask about this product"
              productId={product.productId}
              productName={product.name}
              className={styles.whatsapp}
            />
          </div>
          <p className={styles.disclaimer}>
            Individual results may vary. Consult a qualified healthcare practitioner.
          </p>
        </div>
      </main>

      {/* Progressive sections — each renders only when the approved
          source data for it actually exists. No section here is a
          placeholder; a product with none of these fields populated
          (all 8, today, apart from Kamalahar's evidence link) simply
          skips straight from the hero to Related Products below. */}
      {(product.ingredients?.length || product.usage || product.packSizes?.length || product.evidenceLinked) ? (
        <section className={styles.infoSections} aria-label="Product information">
          {product.ingredients && product.ingredients.length > 0 ? (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>Formulation</h2>
              <ul className={styles.infoList}>
                {product.ingredients.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.usage ? (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>How to Use</h2>
              <p className={styles.infoText}>{product.usage}</p>
            </div>
          ) : null}

          {product.packSizes && product.packSizes.length > 0 ? (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>Pack &amp; Size</h2>
              <ul className={styles.infoList}>
                {product.packSizes.map((size) => (
                  <li key={size}>{size}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.evidenceLinked ? (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoHeading}>Science &amp; Evidence</h2>
              <p className={styles.infoText}>
                Per Khatore&apos;s heritage record, {product.name} is the formulation named in the
                company&apos;s published clinical trial program.
              </p>
              <Link href="/science" className={styles.infoLink}>
                View the clinical record →
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className={styles.related} aria-label="Related products">
          <h2 className={styles.relatedHeading}>More from the archive</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <Link key={p.productId} href={`/products/${p.slug}`} className={styles.relatedTile}>
                <Image src={p.image} alt={p.name} width={120} height={120} className={styles.relatedImg} />
                <span className={styles.relatedName}>{p.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <Footer />
    </>
  );
}
