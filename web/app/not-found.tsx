import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main style={{ padding: '6rem 2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontWeight: 200, fontSize: '2rem', marginBottom: '1rem' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link href="/" style={{ color: 'var(--blue)', borderBottom: '1px solid var(--blue)' }}>
          Return home
        </Link>
      </main>
      <Footer />
    </>
  );
}
