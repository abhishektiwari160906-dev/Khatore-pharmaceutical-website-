import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { BuyButton } from '@/components/BuyButton';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { TrackProductView } from '@/components/TrackProductView';
import { PRODUCTS, getProductBySlug } from '@/data/products';
import styles from './page.module.css';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description ?? `${product.name} — Khatore Pharmaceuticals.`,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <>
      <Nav />
      <TrackProductView productId={product.productId} productName={product.name} />
      <main className={styles.main}>
        <div className={styles.imageCol}>
          <Image src={product.image} alt={product.name} width={295} height={295} priority />
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
            <p className={styles.descPending}>
              A full description for {product.name} is pending Khatore's approval and will be added once
              confirmed.
            </p>
          )}
          {product.price ? (
            <div className={styles.priceArea}>
              <span className={styles.price}>${product.price.amount}</span>
              {product.priceNote ? <span className={styles.priceNote}>{product.priceNote}</span> : null}
            </div>
          ) : null}
          <div className={styles.actions}>
            <BuyButton product={product} className={styles.buy} />
            <WhatsAppCta
              phone="918709206320"
              label="Ask on WhatsApp"
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
      <Footer />
    </>
  );
}
