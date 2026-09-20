import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppCta } from '@/components/WhatsAppCta';
import { CONCERNS, getConcernBySlug, getConcernProducts } from '@/data/concerns';
import styles from './page.module.css';

export function generateStaticParams() {
  return CONCERNS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const concern = getConcernBySlug(params.slug);
  if (!concern) return {};
  return {
    title: concern.name,
    description: concern.description,
    alternates: { canonical: `/concerns/${concern.slug}` },
    openGraph: {
      title: `${concern.name} — Khatore Pharmaceuticals`,
      description: concern.description,
      url: `/concerns/${concern.slug}`,
    },
  };
}

export default function ConcernPage({ params }: { params: { slug: string } }) {
  const concern = getConcernBySlug(params.slug);
  if (!concern) notFound();
  const products = getConcernProducts(concern);

  return (
    <>
      <Nav />
      <main>
        <section className={styles.masthead}>
          <span className={styles.eyebrow}>Shop by Concern</span>
          <h1 className={styles.title}>{concern.name}</h1>
        </section>

        <section className={styles.body}>
          <p className={styles.description}>{concern.description}</p>
        </section>

        {products.length > 0 ? (
          <section className={styles.products} aria-label={`Products for ${concern.name}`}>
            <span className={styles.productsHeading}>Relevant Products</span>
            <div className={styles.productsGrid}>
              {products.map((p) => (
                <Link key={p.productId} href={`/products/${p.slug}`} className={styles.productCard}>
                  <div className={styles.productImg}>
                    <Image src={p.image} alt={p.name} width={180} height={180} />
                  </div>
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productLink}>View product →</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.closing}>
          <Link href="/products" className={styles.textLink}>
            Explore the full collection →
          </Link>
          <WhatsAppCta phone="918709206320" label="Ask about this" className={styles.whatsapp} />
        </section>
      </main>
      <Footer />
    </>
  );
}
